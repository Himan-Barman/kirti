-- ==============================================================================
-- KIRTI — PRODUCTION-GRADE 5-DIMENSION PANDAL RATING DATABASE ARCHITECTURE
-- React + Vite + Supabase PostgreSQL & Row Level Security
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------------
-- 2. PUJA SEASONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.puja_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL UNIQUE CHECK (year >= 1900 AND year <= 3000),
  name TEXT,
  name_bn TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique partial index ensuring only ONE current season
CREATE UNIQUE INDEX IF NOT EXISTS one_current_puja_season
ON public.puja_seasons (is_current)
WHERE is_current = true;

-- Seed default current season
INSERT INTO public.puja_seasons (year, name, name_bn, is_current, is_active)
VALUES (2026, 'Durga Puja 2026', 'দুর্গাপূজা ২০২৬', true, true)
ON CONFLICT (year) DO UPDATE 
SET is_current = true, is_active = true, updated_at = now();

-- ------------------------------------------------------------------------------
-- 3. PROFILES & SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE CHECK (username ~* '^[a-z0-9_.]{3,30}$'),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profile_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  visit_visibility TEXT NOT NULL DEFAULT 'friends' CHECK (visit_visibility IN ('public', 'friends', 'private')),
  rating_visibility TEXT NOT NULL DEFAULT 'public' CHECK (rating_visibility IN ('public', 'friends', 'private')),
  allow_friend_requests BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. PANDALS & LOCATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pandals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  name TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT NOT NULL UNIQUE,
  committee_name TEXT,
  description TEXT,
  historical_significance TEXT,
  founded_year INTEGER,
  heritage_status TEXT,
  alternate_names TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'moved', 'temporarily_closed', 'unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pandal_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandal_id UUID UNIQUE NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  neighbourhood TEXT,
  locality TEXT,
  ward TEXT,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Kolkata',
  state TEXT DEFAULT 'West Bengal',
  country TEXT DEFAULT 'India',
  pincode TEXT,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  location GEOGRAPHY(Point, 4326),
  coordinate_confidence TEXT NOT NULL DEFAULT 'medium',
  google_maps_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial point trigger
CREATE OR REPLACE FUNCTION sync_pandal_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_pandal_geography ON public.pandal_locations;
CREATE TRIGGER trg_sync_pandal_geography
BEFORE INSERT OR UPDATE ON public.pandal_locations
FOR EACH ROW EXECUTE FUNCTION sync_pandal_geography();

-- ------------------------------------------------------------------------------
-- 5. RATING CATEGORIES (EXACTLY 5 DIMENSIONS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rating_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed exactly the 5 official dimensions
INSERT INTO public.rating_categories (code, name, name_bn, description, sort_order)
VALUES
  ('overall', 'Overall', 'সামগ্রিক', 'Overall impression of the Puja pandal.', 1),
  ('theme', 'Theme', 'থিম', 'Creativity, concept and execution of the theme.', 2),
  ('idol', 'Idol', 'প্রতিমা', 'Idol design, artistry, presentation and traditional/creative quality.', 3),
  ('lighting', 'Lighting', 'আলোসজ্জা', 'Lighting quality, atmosphere and visual presentation.', 4),
  ('management', 'Management', 'ব্যবস্থাপনা', 'Organization, visitor handling, cleanliness and general management.', 5)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, name_bn = EXCLUDED.name_bn, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

-- ------------------------------------------------------------------------------
-- 6. MAIN RATINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.puja_seasons(id) ON DELETE RESTRICT,
  review TEXT CHECK (length(review) <= 1000),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pandal_id, season_id)
);

-- ------------------------------------------------------------------------------
-- 7. CATEGORY SCORE TABLE (1–5 WHOLE STARS FOR EACH DIMENSION)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rating_category_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.rating_categories(id) ON DELETE RESTRICT,
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rating_id, category_id)
);

-- ------------------------------------------------------------------------------
-- 8. VISITS, FRIENDSHIPS & REPORTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.puja_seasons(id) ON DELETE RESTRICT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pandal_id, season_id)
);

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_canonical_friendship_pair
ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

CREATE TABLE IF NOT EXISTS public.rating_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'removed')),
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rating_id, reporter_id)
);

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS ratings_pandal_season_idx ON public.ratings (pandal_id, season_id);
CREATE INDEX IF NOT EXISTS ratings_user_season_idx ON public.ratings (user_id, season_id);
CREATE INDEX IF NOT EXISTS rating_scores_rating_idx ON public.rating_category_scores (rating_id);
CREATE INDEX IF NOT EXISTS rating_scores_category_idx ON public.rating_category_scores (category_id);
CREATE INDEX IF NOT EXISTS rating_categories_order_idx ON public.rating_categories (sort_order);

-- ------------------------------------------------------------------------------
-- 10. DATABASE VIEWS
-- ------------------------------------------------------------------------------

-- Pandal Rating Summary (5-Dimension Averages & Counts)
CREATE OR REPLACE VIEW public.pandal_rating_summary AS
SELECT 
  r.pandal_id,
  r.season_id,
  ROUND(AVG(CASE WHEN rc.code = 'overall' THEN rcs.score END)::numeric, 1) AS overall_rating,
  ROUND(AVG(CASE WHEN rc.code = 'theme' THEN rcs.score END)::numeric, 1) AS theme_rating,
  ROUND(AVG(CASE WHEN rc.code = 'idol' THEN rcs.score END)::numeric, 1) AS idol_rating,
  ROUND(AVG(CASE WHEN rc.code = 'lighting' THEN rcs.score END)::numeric, 1) AS lighting_rating,
  ROUND(AVG(CASE WHEN rc.code = 'management' THEN rcs.score END)::numeric, 1) AS management_rating,
  COUNT(DISTINCT r.id)::integer AS total_ratings,
  COUNT(CASE WHEN rc.code = 'overall' THEN 1 END)::integer AS overall_count,
  COUNT(CASE WHEN rc.code = 'theme' THEN 1 END)::integer AS theme_count,
  COUNT(CASE WHEN rc.code = 'idol' THEN 1 END)::integer AS idol_count,
  COUNT(CASE WHEN rc.code = 'lighting' THEN 1 END)::integer AS lighting_count,
  COUNT(CASE WHEN rc.code = 'management' THEN 1 END)::integer AS management_count
FROM public.ratings r
JOIN public.rating_category_scores rcs ON rcs.rating_id = r.id
JOIN public.rating_categories rc ON rc.id = rcs.category_id
WHERE r.is_visible = true
GROUP BY r.pandal_id, r.season_id;

-- ------------------------------------------------------------------------------
-- 11. SECURE 5-DIMENSION RATING RPC FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_pandal_rating(
  p_pandal_id UUID,
  p_overall INTEGER,
  p_theme INTEGER,
  p_idol INTEGER,
  p_lighting INTEGER,
  p_management INTEGER,
  p_review TEXT DEFAULT NULL,
  p_season_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_season_id UUID;
  v_rating_id UUID;
  v_cat_overall UUID;
  v_cat_theme UUID;
  v_cat_idol UUID;
  v_cat_lighting UUID;
  v_cat_management UUID;
  v_result JSONB;
BEGIN
  -- 1. Identify authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to submit rating.';
  END IF;

  -- 2. Validate all 5 integer scores (1–5)
  IF p_overall NOT BETWEEN 1 AND 5 OR
     p_theme NOT BETWEEN 1 AND 5 OR
     p_idol NOT BETWEEN 1 AND 5 OR
     p_lighting NOT BETWEEN 1 AND 5 OR
     p_management NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'All 5 rating scores (Overall, Theme, Idol, Lighting, Management) must be whole integers between 1 and 5.';
  END IF;

  -- 3. Determine active season
  IF p_season_id IS NOT NULL THEN
    v_season_id := p_season_id;
  ELSE
    SELECT id INTO v_season_id FROM public.puja_seasons WHERE is_current = true LIMIT 1;
    IF v_season_id IS NULL THEN
      SELECT id INTO v_season_id FROM public.puja_seasons WHERE is_active = true ORDER BY year DESC LIMIT 1;
    END IF;
  END IF;

  IF v_season_id IS NULL THEN
    RAISE EXCEPTION 'No active Puja season available.';
  END IF;

  -- 4. Lookup Category UUIDs
  SELECT id INTO v_cat_overall FROM public.rating_categories WHERE code = 'overall';
  SELECT id INTO v_cat_theme FROM public.rating_categories WHERE code = 'theme';
  SELECT id INTO v_cat_idol FROM public.rating_categories WHERE code = 'idol';
  SELECT id INTO v_cat_lighting FROM public.rating_categories WHERE code = 'lighting';
  SELECT id INTO v_cat_management FROM public.rating_categories WHERE code = 'management';

  IF v_cat_overall IS NULL OR v_cat_theme IS NULL OR v_cat_idol IS NULL OR v_cat_lighting IS NULL OR v_cat_management IS NULL THEN
    RAISE EXCEPTION 'Rating categories not properly configured in database.';
  END IF;

  -- 5. Upsert Main Rating Record
  INSERT INTO public.ratings (user_id, pandal_id, season_id, review, is_visible, updated_at)
  VALUES (v_user_id, p_pandal_id, v_season_id, trim(p_review), true, now())
  ON CONFLICT (user_id, pandal_id, season_id) DO UPDATE
  SET review = EXCLUDED.review, updated_at = now()
  RETURNING id INTO v_rating_id;

  -- 6. Upsert All 5 Category Scores
  INSERT INTO public.rating_category_scores (rating_id, category_id, score, updated_at)
  VALUES 
    (v_rating_id, v_cat_overall, p_overall::smallint, now()),
    (v_rating_id, v_cat_theme, p_theme::smallint, now()),
    (v_rating_id, v_cat_idol, p_idol::smallint, now()),
    (v_rating_id, v_cat_lighting, p_lighting::smallint, now()),
    (v_rating_id, v_cat_management, p_management::smallint, now())
  ON CONFLICT (rating_id, category_id) DO UPDATE
  SET score = EXCLUDED.score, updated_at = now();

  -- 7. Build and return result object
  v_result := jsonb_build_object(
    'success', true,
    'rating_id', v_rating_id,
    'pandal_id', p_pandal_id,
    'season_id', v_season_id,
    'scores', jsonb_build_object(
      'overall', p_overall,
      'theme', p_theme,
      'idol', p_idol,
      'lighting', p_lighting,
      'management', p_management
    ),
    'review', p_review
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.rating_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_category_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_reports ENABLE ROW LEVEL SECURITY;

-- Rating Categories: Public Read
CREATE POLICY "Categories Public Select" ON public.rating_categories 
FOR SELECT USING (is_active = true);

-- Ratings: Select allowed by visibility
CREATE POLICY "Ratings Public Select" ON public.ratings 
FOR SELECT USING (is_visible = true);

CREATE POLICY "Ratings Self Insert" ON public.ratings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ratings Self Update" ON public.ratings 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Ratings Self Delete" ON public.ratings 
FOR DELETE USING (auth.uid() = user_id);

-- Category Scores: Select allowed for parent ratings
CREATE POLICY "Scores Public Select" ON public.rating_category_scores 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.ratings r 
    WHERE r.id = rating_category_scores.rating_id AND r.is_visible = true
  )
);

-- Crucial: Insert/Update/Delete requires ownership of the PARENT rating record
CREATE POLICY "Scores Parent Owner Insert" ON public.rating_category_scores 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ratings r 
    WHERE r.id = rating_category_scores.rating_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Scores Parent Owner Update" ON public.rating_category_scores 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.ratings r 
    WHERE r.id = rating_category_scores.rating_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Scores Parent Owner Delete" ON public.rating_category_scores 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.ratings r 
    WHERE r.id = rating_category_scores.rating_id AND r.user_id = auth.uid()
  )
);
