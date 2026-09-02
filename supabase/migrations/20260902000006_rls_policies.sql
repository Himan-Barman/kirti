-- ==============================================================================
-- KIRTI — MIGRATION 006: ROW LEVEL SECURITY (RLS)
-- Contains: RLS Enablement and Policies for all user-sensitive tables
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENABLE RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.rating_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_category_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_reports ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. MASTER DATA RLS (Public Read, Admin Write)
-- ------------------------------------------------------------------------------
-- Note: Pandals, locations, seasons, etc. are implicitly public if we don't enable RLS on them, 
-- or we can enable RLS and add public read policies. We leave them without RLS for now to allow 
-- easy public reads, but they are protected from public API writes by not exposing inserts/updates.

-- ------------------------------------------------------------------------------
-- 3. PROFILES & SETTINGS POLICIES
-- ------------------------------------------------------------------------------
-- Profiles: Anyone can read public profiles or friends' profiles
CREATE POLICY "Profiles Read" ON public.profiles 
FOR SELECT USING (
  -- Always can read own profile
  auth.uid() = id
  OR 
  -- Can read public profiles
  EXISTS (
    SELECT 1 FROM public.profile_settings ps 
    WHERE ps.user_id = profiles.id AND ps.profile_visibility = 'public'
  )
  OR
  -- Can read friends' profiles
  EXISTS (
    SELECT 1 FROM public.friendships f 
    WHERE f.status = 'accepted' AND (
      (f.requester_id = auth.uid() AND f.addressee_id = profiles.id) OR 
      (f.addressee_id = auth.uid() AND f.requester_id = profiles.id)
    )
  )
);

CREATE POLICY "Profiles Update" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Profile Settings: Only owner can read/write
CREATE POLICY "Profile Settings Select" ON public.profile_settings 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Profile Settings Update" ON public.profile_settings 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Profile Settings Insert" ON public.profile_settings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Roles: Only admins can read/write (Normal users can't see or change roles)
CREATE POLICY "User Roles Read Admin" ON public.user_roles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator')
  )
  OR auth.uid() = user_id
);

-- ------------------------------------------------------------------------------
-- 4. FRIENDSHIPS & VISITS POLICIES
-- ------------------------------------------------------------------------------
-- Friendships: Users can only see and interact with relationships involving themselves
CREATE POLICY "Friendships Select" ON public.friendships 
FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Direct inserts/updates are disabled for the public via API. Must use RPCs.
-- But if needed, restrict to owner:
CREATE POLICY "Friendships Insert" ON public.friendships 
FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Friendships Update" ON public.friendships 
FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Visits
CREATE POLICY "Visits Insert" ON public.visits 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Visits Update" ON public.visits 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Visits Delete" ON public.visits 
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Visits Select" ON public.visits 
FOR SELECT USING (
  -- Own visits
  auth.uid() = user_id
  OR
  -- Public visits
  EXISTS (
    SELECT 1 FROM public.profile_settings ps 
    WHERE ps.user_id = visits.user_id AND ps.visit_visibility = 'public'
  )
  OR
  -- Friends visits
  (
    EXISTS (
      SELECT 1 FROM public.profile_settings ps 
      WHERE ps.user_id = visits.user_id AND ps.visit_visibility = 'friends'
    )
    AND EXISTS (
      SELECT 1 FROM public.friendships f 
      WHERE f.status = 'accepted' AND (
        (f.requester_id = auth.uid() AND f.addressee_id = visits.user_id) OR 
        (f.addressee_id = auth.uid() AND f.requester_id = visits.user_id)
      )
    )
  )
);

-- ------------------------------------------------------------------------------
-- 5. RATINGS & SCORES POLICIES
-- ------------------------------------------------------------------------------
-- Rating Categories: Public Read
CREATE POLICY "Categories Public Select" ON public.rating_categories 
FOR SELECT USING (is_active = true);

-- Ratings Select
CREATE POLICY "Ratings Select" ON public.ratings 
FOR SELECT USING (
  -- Own ratings
  auth.uid() = user_id
  OR
  -- Public ratings (if visible)
  (is_visible = true AND EXISTS (
    SELECT 1 FROM public.profile_settings ps 
    WHERE ps.user_id = ratings.user_id AND ps.rating_visibility = 'public'
  ))
  OR
  -- Friends ratings
  (is_visible = true AND EXISTS (
    SELECT 1 FROM public.profile_settings ps 
    WHERE ps.user_id = ratings.user_id AND ps.rating_visibility = 'friends'
  ) AND EXISTS (
    SELECT 1 FROM public.friendships f 
    WHERE f.status = 'accepted' AND (
      (f.requester_id = auth.uid() AND f.addressee_id = ratings.user_id) OR 
      (f.addressee_id = auth.uid() AND f.requester_id = ratings.user_id)
    )
  ))
);

-- Ratings Mutations (Should use RPC, but secure anyway)
CREATE POLICY "Ratings Insert" ON public.ratings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ratings Update" ON public.ratings 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Ratings Delete" ON public.ratings 
FOR DELETE USING (auth.uid() = user_id);

-- Rating Scores: Parent ownership validation
CREATE POLICY "Scores Select" ON public.rating_category_scores 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.ratings r 
    WHERE r.id = rating_category_scores.rating_id 
    -- The parent ratings select policy implicitly handles visibility rules if we could chain them, 
    -- but we need to duplicate the logic or use a security definer view for performance.
    -- For now, if the user can see the parent rating, they can see the score.
  )
);

CREATE POLICY "Scores Insert" ON public.rating_category_scores 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ratings r 
    WHERE r.id = rating_category_scores.rating_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Scores Update" ON public.rating_category_scores 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.ratings r 
    WHERE r.id = rating_category_scores.rating_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Scores Delete" ON public.rating_category_scores 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.ratings r 
    WHERE r.id = rating_category_scores.rating_id AND r.user_id = auth.uid()
  )
);
