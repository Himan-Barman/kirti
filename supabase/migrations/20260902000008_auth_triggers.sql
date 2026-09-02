-- ==============================================================================
-- KIRTI — MIGRATION 008: AUTH TRIGGERS
-- Contains: Automatic Profile & Profile Settings creation on Supabase Auth Signup
-- ==============================================================================

BEGIN;

-- 1. Create the function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- Generate a deterministic unique temporary username
  -- e.g. "user_8f2a1b3c"
  v_username := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8);

  -- Handle unlikely collisions by appending random chars if needed
  -- (A simple loop or just relying on the 8 chars from UUID is usually enough for temporary)
  
  -- Insert into public.profiles
  INSERT INTO public.profiles (
    id,
    username,
    display_name
  )
  VALUES (
    NEW.id,
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Kirti User')
  );

  -- Insert default profile settings
  INSERT INTO public.profile_settings (
    user_id,
    profile_visibility,
    visit_visibility,
    rating_visibility,
    allow_friend_requests
  )
  VALUES (
    NEW.id,
    'public',
    'friends',
    'public',
    true
  );

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
