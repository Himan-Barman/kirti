-- ==============================================================================
-- KIRTI — MIGRATION 004: RANKING ENGINE
-- Contains: Ranking Parameters, Ranking Runs, Pandal Rankings, Calculation Pipeline
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. RANKING PARAMETERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ranking_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.puja_seasons(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.rating_categories(id) ON DELETE CASCADE,
  ranking_version TEXT NOT NULL,
  prior_mean NUMERIC(10,8) NOT NULL,
  prior_strength NUMERIC(12,4) NOT NULL,
  lambda_lower_bound NUMERIC(8,6) NOT NULL DEFAULT 0.700000,
  lambda_bayesian NUMERIC(8,6) NOT NULL DEFAULT 0.300000,
  minimum_ratings INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(season_id, category_id, ranking_version),
  CONSTRAINT lambda_sum_check CHECK (
    ABS(lambda_lower_bound + lambda_bayesian - 1.0) < 0.0001
  )
);

-- ------------------------------------------------------------------------------
-- 2. RANKING RUNS (Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ranking_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.puja_seasons(id) ON DELETE CASCADE,
  ranking_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','completed','failed')),
  parameters JSONB,
  pandals_processed INTEGER,
  ratings_processed BIGINT,
  categories_processed INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. PANDAL RANKINGS (Versioned Snapshots)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pandal_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.puja_seasons(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.rating_categories(id) ON DELETE CASCADE,
  
  raw_mean NUMERIC(8,6),
  bayesian_mean NUMERIC(8,6),
  lower_confidence_score NUMERIC(8,6),
  final_score NUMERIC(8,6),
  
  raw_rating_count INTEGER NOT NULL DEFAULT 0,
  effective_sample_size NUMERIC(12,4),
  standard_deviation NUMERIC(12,6),
  
  one_star INTEGER DEFAULT 0,
  two_star INTEGER DEFAULT 0,
  three_star INTEGER DEFAULT 0,
  four_star INTEGER DEFAULT 0,
  five_star INTEGER DEFAULT 0,
  
  rank INTEGER,
  is_rank_eligible BOOLEAN NOT NULL DEFAULT false,
  eligibility_reason TEXT,
  
  ranking_version TEXT NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pandal_id, season_id, category_id, ranking_version)
);

CREATE INDEX IF NOT EXISTS pandal_rankings_lookup_idx ON public.pandal_rankings (season_id, category_id, rank);
CREATE INDEX IF NOT EXISTS pandal_rankings_score_idx ON public.pandal_rankings (season_id, category_id, final_score DESC);

-- ------------------------------------------------------------------------------
-- 4. ATOMIC CALCULATION PIPELINE (PostgreSQL RPC)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_pandal_rankings(p_season_id UUID, p_version TEXT)
RETURNS JSONB AS $$
DECLARE
  v_run_id UUID;
  v_category RECORD;
  v_prior_mean NUMERIC;
  v_prior_strength NUMERIC;
  v_lambda_lcb NUMERIC := 0.70;
  v_lambda_bayesian NUMERIC := 0.30;
  v_min_ratings INTEGER := 10;
  v_pandals_processed INTEGER := 0;
  v_ratings_processed BIGINT := 0;
BEGIN
  -- 1. Create a new ranking run (audit)
  INSERT INTO public.ranking_runs (season_id, ranking_version, status, started_at)
  VALUES (p_season_id, p_version, 'running', now())
  RETURNING id INTO v_run_id;
  
  -- 2. Process each category independently
  FOR v_category IN (SELECT id, code FROM public.rating_categories WHERE is_active = true) LOOP
    
    -- a. Calculate population Prior Mean (C) for the entire season/category
    SELECT COALESCE(AVG(score), 3.0)::NUMERIC 
    INTO v_prior_mean
    FROM public.rating_category_scores rcs
    JOIN public.ratings r ON r.id = rcs.rating_id
    WHERE r.season_id = p_season_id 
      AND rcs.category_id = v_category.id
      AND r.is_visible = true;

    -- b. Determine Prior Strength (m) using the 60th percentile of rating counts
    WITH counts AS (
      SELECT COUNT(r.id) as cnt
      FROM public.ratings r
      JOIN public.rating_category_scores rcs ON r.id = rcs.rating_id
      WHERE r.season_id = p_season_id 
        AND rcs.category_id = v_category.id
        AND r.is_visible = true
      GROUP BY r.pandal_id
      HAVING COUNT(r.id) > 0
    )
    SELECT COALESCE(PERCENTILE_CONT(0.60) WITHIN GROUP (ORDER BY cnt), 5.0)::NUMERIC
    INTO v_prior_strength
    FROM counts;

    -- Save parameters for the version
    INSERT INTO public.ranking_parameters (season_id, category_id, ranking_version, prior_mean, prior_strength, lambda_lower_bound, lambda_bayesian, minimum_ratings)
    VALUES (p_season_id, v_category.id, p_version, v_prior_mean, v_prior_strength, v_lambda_lcb, v_lambda_bayesian, v_min_ratings)
    ON CONFLICT (season_id, category_id, ranking_version) DO NOTHING;

    -- c. Calculate rankings for all pandals in this category for this season
    WITH pandal_stats AS (
      SELECT 
        r.pandal_id,
        COUNT(r.id) as n,
        AVG(rcs.score) as raw_mean,
        STDDEV(rcs.score) as std_dev,
        COUNT(CASE WHEN rcs.score = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN rcs.score = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rcs.score = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rcs.score = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rcs.score = 5 THEN 1 END) as five_star
      FROM public.ratings r
      JOIN public.rating_category_scores rcs ON r.id = rcs.rating_id
      WHERE r.season_id = p_season_id 
        AND rcs.category_id = v_category.id
        AND r.is_visible = true
      GROUP BY r.pandal_id
    ),
    calculated AS (
      SELECT 
        pandal_id,
        n,
        raw_mean,
        std_dev,
        one_star, two_star, three_star, four_star, five_star,
        -- Bayesian Shrinkage (B)
        ((n / (n + v_prior_strength)) * raw_mean + (v_prior_strength / (n + v_prior_strength)) * v_prior_mean) AS bayesian_mean,
        -- Wilson Lower Bound (L) mapped from 1-5 to 0-1 scale and back
        (
          (
            ( ((raw_mean - 1.0)/4.0) + (1.96*1.96)/(2.0*n) - 1.96 * SQRT( ( ((raw_mean - 1.0)/4.0) * (1.0 - ((raw_mean - 1.0)/4.0)) + (1.96*1.96)/(4.0*n) ) / n ) )
            / (1.0 + (1.96*1.96)/n)
          ) * 4.0 + 1.0
        ) AS lower_confidence,
        -- Eligibility
        CASE WHEN n >= v_min_ratings THEN true ELSE false END AS is_eligible
      FROM pandal_stats
    ),
    scored AS (
      SELECT 
        *,
        -- Final Score (S) = λ*L + (1-λ)*B
        (v_lambda_lcb * lower_confidence) + (v_lambda_bayesian * bayesian_mean) AS final_score
      FROM calculated
    )
    
    -- d. Insert the rankings (with rank ordering)
    INSERT INTO public.pandal_rankings (
      pandal_id, season_id, category_id, ranking_version,
      raw_rating_count, raw_mean, standard_deviation,
      one_star, two_star, three_star, four_star, five_star,
      bayesian_mean, lower_confidence_score, final_score,
      is_rank_eligible, eligibility_reason, rank, calculated_at
    )
    SELECT 
      pandal_id, p_season_id, v_category.id, p_version,
      n, raw_mean, std_dev,
      one_star, two_star, three_star, four_star, five_star,
      bayesian_mean, lower_confidence, final_score,
      is_eligible, CASE WHEN NOT is_eligible THEN 'Insufficient ratings' ELSE NULL END,
      RANK() OVER (
        PARTITION BY is_eligible 
        ORDER BY 
          final_score DESC, 
          lower_confidence DESC, 
          n DESC, 
          pandal_id -- deterministic tie-breaker
      ) as rank,
      now()
    FROM scored
    ON CONFLICT (pandal_id, season_id, category_id, ranking_version) 
    DO UPDATE SET 
      raw_rating_count = EXCLUDED.raw_rating_count,
      raw_mean = EXCLUDED.raw_mean,
      bayesian_mean = EXCLUDED.bayesian_mean,
      lower_confidence_score = EXCLUDED.lower_confidence_score,
      final_score = EXCLUDED.final_score,
      rank = EXCLUDED.rank,
      is_rank_eligible = EXCLUDED.is_rank_eligible,
      calculated_at = EXCLUDED.calculated_at;

    -- Tracking metrics
    SELECT COUNT(*), SUM(n) INTO v_pandals_processed, v_ratings_processed FROM pandal_stats;

  END LOOP;

  -- 3. Update run status
  UPDATE public.ranking_runs 
  SET status = 'completed', 
      completed_at = now(),
      pandals_processed = v_pandals_processed,
      ratings_processed = v_ratings_processed,
      categories_processed = 5
  WHERE id = v_run_id;

  RETURN jsonb_build_object('success', true, 'version', p_version, 'run_id', v_run_id);
EXCEPTION WHEN OTHERS THEN
  UPDATE public.ranking_runs SET status = 'failed', error_message = SQLERRM, completed_at = now() WHERE id = v_run_id;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
