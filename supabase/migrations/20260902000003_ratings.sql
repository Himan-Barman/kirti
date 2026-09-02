-- ==============================================================================
-- KIRTI — MIGRATION 003: RATINGS
-- Contains: Rating Categories, Ratings, Scores, Reports, submit_rating RPC, Views
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. RATING CATEGORIES (EXACTLY 5 DIMENSIONS)
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

-- Seed exactly the 5 official dimensions. Do not add extra user-rating dimensions.
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
-- 2. MAIN RATINGS TABLE
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

CREATE INDEX IF NOT EXISTS ratings_pandal_season_idx ON public.ratings (pandal_id, season_id);
CREATE INDEX IF NOT EXISTS ratings_user_season_idx ON public.ratings (user_id, season_id);

-- ------------------------------------------------------------------------------
-- 3. CATEGORY SCORE TABLE
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

CREATE INDEX IF NOT EXISTS rating_scores_rating_idx ON public.rating_category_scores (rating_id);
CREATE INDEX IF NOT EXISTS rating_scores_category_idx ON public.rating_category_scores (category_id);

-- ------------------------------------------------------------------------------
-- 4. RATING REPORTS
-- ------------------------------------------------------------------------------
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
-- 5. SECURE 5-DIMENSION RATING RPC FUNCTION
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

  -- 4. Lookup Category UUIDs strictly based on the 5 codes
  SELECT id INTO v_cat_overall FROM public.rating_categories WHERE code = 'overall';
  SELECT id INTO v_cat_theme FROM public.rating_categories WHERE code = 'theme';
  SELECT id INTO v_cat_idol FROM public.rating_categories WHERE code = 'idol';
  SELECT id INTO v_cat_lighting FROM public.rating_categories WHERE code = 'lighting';
  SELECT id INTO v_cat_management FROM public.rating_categories WHERE code = 'management';

  IF v_cat_overall IS NULL OR v_cat_theme IS NULL OR v_cat_idol IS NULL OR v_cat_lighting IS NULL OR v_cat_management IS NULL THEN
    RAISE EXCEPTION 'Rating categories not properly configured in database.';
  END IF;

  -- 5. Upsert Main Rating Record securely
  INSERT INTO public.ratings (user_id, pandal_id, season_id, review, is_visible, updated_at)
  VALUES (v_user_id, p_pandal_id, v_season_id, trim(p_review), true, now())
  ON CONFLICT (user_id, pandal_id, season_id) DO UPDATE
  SET review = EXCLUDED.review, updated_at = now()
  RETURNING id INTO v_rating_id;

  -- 6. Upsert All 5 Category Scores exactly
  INSERT INTO public.rating_category_scores (rating_id, category_id, score, updated_at)
  VALUES 
    (v_rating_id, v_cat_overall, p_overall::smallint, now()),
    (v_rating_id, v_cat_theme, p_theme::smallint, now()),
    (v_rating_id, v_cat_idol, p_idol::smallint, now()),
    (v_rating_id, v_cat_lighting, p_lighting::smallint, now()),
    (v_rating_id, v_cat_management, p_management::smallint, now())
  ON CONFLICT (rating_id, category_id) DO UPDATE
  SET score = EXCLUDED.score, updated_at = now();

  -- 7. Return Result
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 6. PANDAL RATING SUMMARY VIEW
-- ------------------------------------------------------------------------------
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
  COUNT(CASE WHEN rc.code = 'management' THEN 1 END)::integer AS management_count,
  -- Distributions
  COUNT(CASE WHEN rcs.score = 1 THEN 1 END)::integer AS count_1_star,
  COUNT(CASE WHEN rcs.score = 2 THEN 1 END)::integer AS count_2_star,
  COUNT(CASE WHEN rcs.score = 3 THEN 1 END)::integer AS count_3_star,
  COUNT(CASE WHEN rcs.score = 4 THEN 1 END)::integer AS count_4_star,
  COUNT(CASE WHEN rcs.score = 5 THEN 1 END)::integer AS count_5_star
FROM public.ratings r
JOIN public.rating_category_scores rcs ON rcs.rating_id = r.id
JOIN public.rating_categories rc ON rc.id = rcs.category_id
WHERE r.is_visible = true
GROUP BY r.pandal_id, r.season_id;
