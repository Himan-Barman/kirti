-- ==============================================================================
-- KIRTI — MIGRATION 002: USER & SOCIAL
-- Contains: Profiles, Profile Settings, User Roles, Friendships, Visits, Social RPCs
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES & SETTINGS
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

-- Note: We now add the foreign key from data_verifications to profiles
ALTER TABLE public.data_verifications 
  ADD CONSTRAINT fk_data_verifications_profiles 
  FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

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
-- 2. VISITS
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

CREATE INDEX IF NOT EXISTS visits_pandal_season_idx ON public.visits (pandal_id, season_id);
CREATE INDEX IF NOT EXISTS visits_user_season_idx ON public.visits (user_id, season_id);

-- ------------------------------------------------------------------------------
-- 3. FRIENDSHIPS
-- ------------------------------------------------------------------------------
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

-- Canonical pair index to prevent A->B and B->A from existing simultaneously
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_canonical_friendship_pair
ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

CREATE INDEX IF NOT EXISTS friendships_requester_status_idx ON public.friendships (requester_id, status);
CREATE INDEX IF NOT EXISTS friendships_addressee_status_idx ON public.friendships (addressee_id, status);

-- ------------------------------------------------------------------------------
-- 4. FRIENDSHIP SECURE RPCs
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.send_friend_request(p_target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_target_exists BOOLEAN;
  v_allow_requests BOOLEAN;
  v_existing_status TEXT;
  v_result JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF v_user_id = p_target_user_id THEN
    RAISE EXCEPTION 'Cannot send friend request to yourself.';
  END IF;

  -- Check if target exists and allows requests
  SELECT p.id IS NOT NULL, ps.allow_friend_requests 
  INTO v_target_exists, v_allow_requests
  FROM public.profiles p
  LEFT JOIN public.profile_settings ps ON ps.user_id = p.id
  WHERE p.id = p_target_user_id;

  IF NOT v_target_exists THEN
    RAISE EXCEPTION 'Target user does not exist.';
  END IF;

  IF NOT v_allow_requests THEN
    RAISE EXCEPTION 'Target user is not accepting friend requests.';
  END IF;

  -- Check existing canonical relationship
  SELECT status INTO v_existing_status FROM public.friendships
  WHERE LEAST(requester_id, addressee_id) = LEAST(v_user_id, p_target_user_id)
    AND GREATEST(requester_id, addressee_id) = GREATEST(v_user_id, p_target_user_id);

  IF v_existing_status IS NOT NULL THEN
    IF v_existing_status = 'blocked' THEN
      RAISE EXCEPTION 'You cannot interact with this user.';
    END IF;
    RAISE EXCEPTION 'A friendship or pending request already exists.';
  END IF;

  INSERT INTO public.friendships (requester_id, addressee_id, status)
  VALUES (v_user_id, p_target_user_id, 'pending');

  v_result := jsonb_build_object('success', true, 'message', 'Friend request sent.');
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.accept_friend_request(p_requester_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_updated BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  UPDATE public.friendships
  SET status = 'accepted', accepted_at = now(), updated_at = now()
  WHERE requester_id = p_requester_id AND addressee_id = v_user_id AND status = 'pending'
  RETURNING true INTO v_updated;

  IF v_updated IS NULL THEN
    RAISE EXCEPTION 'No pending friend request found from this user.';
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Friend request accepted.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.decline_friend_request(p_requester_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_updated BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  UPDATE public.friendships
  SET status = 'declined', updated_at = now()
  WHERE requester_id = p_requester_id AND addressee_id = v_user_id AND status = 'pending'
  RETURNING true INTO v_updated;

  IF v_updated IS NULL THEN
    RAISE EXCEPTION 'No pending friend request found from this user.';
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Friend request declined.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.remove_friend(p_target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_deleted BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  DELETE FROM public.friendships
  WHERE (requester_id = v_user_id AND addressee_id = p_target_user_id AND status = 'accepted')
     OR (requester_id = p_target_user_id AND addressee_id = v_user_id AND status = 'accepted')
  RETURNING true INTO v_deleted;

  IF v_deleted IS NULL THEN
    RAISE EXCEPTION 'Friendship not found.';
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Friend removed.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.block_user(p_target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF v_user_id = p_target_user_id THEN
    RAISE EXCEPTION 'Cannot block yourself.';
  END IF;

  INSERT INTO public.friendships (requester_id, addressee_id, status, updated_at)
  VALUES (v_user_id, p_target_user_id, 'blocked', now())
  ON CONFLICT (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id))
  DO UPDATE SET status = 'blocked', requester_id = EXCLUDED.requester_id, addressee_id = EXCLUDED.addressee_id, accepted_at = NULL, updated_at = now();

  RETURN jsonb_build_object('success', true, 'message', 'User blocked.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
