-- ==============================================================================
-- KIRTI — MIGRATION 001: MASTER DATA
-- Contains: Extensions, Puja Seasons, Profiles, Zones, Pandals, Categories, Tags
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
ON CONFLICT (year) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. ZONES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  name_bn TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.zones (code, name, name_bn)
VALUES 
  ('north', 'North Kolkata', 'উত্তর কলকাতা'),
  ('south', 'South Kolkata', 'দক্ষিণ কলকাতা'),
  ('central', 'Central Kolkata', 'মধ্য কলকাতা'),
  ('east', 'East Kolkata', 'পূর্ব কলকাতা'),
  ('west', 'West Kolkata', 'পশ্চিম কলকাতা')
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. CATEGORIES (General discovery, not user rating dimensions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  name_bn TEXT,
  description TEXT,
  category_group TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. TAGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT,
  name_bn TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. PANDAL CLUSTERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pandal_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  name TEXT,
  name_bn TEXT,
  area TEXT,
  centre_lat DOUBLE PRECISION,
  centre_lng DOUBLE PRECISION,
  nearby_metro TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. DATA SOURCES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source_type TEXT,
  base_url TEXT,
  is_trusted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 8. PANDALS
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

-- ------------------------------------------------------------------------------
-- 9. PANDAL LOCATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pandal_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandal_id UUID NOT NULL UNIQUE REFERENCES public.pandals(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
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
  coordinate_confidence TEXT NOT NULL DEFAULT 'medium' CHECK (coordinate_confidence IN ('high', 'medium', 'low')),
  google_maps_url TEXT,
  location_source TEXT,
  location_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS pandal_locations_geom_idx ON public.pandal_locations USING GIST(location);

-- ------------------------------------------------------------------------------
-- 10. PANDAL MAPPINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pandal_categories (
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pandal_id, category_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS one_primary_category_per_pandal
ON public.pandal_categories (pandal_id)
WHERE is_primary = true;

CREATE TABLE IF NOT EXISTS public.pandal_tags (
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (pandal_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.cluster_pandals (
  cluster_id UUID NOT NULL REFERENCES public.pandal_clusters(id) ON DELETE CASCADE,
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  sort_order INTEGER,
  notes TEXT,
  PRIMARY KEY (cluster_id, pandal_id),
  UNIQUE (cluster_id, sort_order)
);

CREATE TABLE IF NOT EXISTS public.pandal_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  value TEXT NOT NULL,
  value_bn TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pandal_id, feature_type, value)
);

CREATE TABLE IF NOT EXISTS public.pandal_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.puja_seasons(id) ON DELETE CASCADE,
  theme TEXT,
  artist TEXT,
  concept TEXT,
  awards TEXT[],
  notes TEXT,
  data_confidence TEXT CHECK (data_confidence IN ('high', 'medium', 'low')),
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pandal_id, season_id)
);

CREATE TABLE IF NOT EXISTS public.pandal_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  season_id UUID REFERENCES public.puja_seasons(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  caption TEXT,
  caption_bn TEXT,
  source_url TEXT,
  source_type TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_primary_image_per_pandal_season
ON public.pandal_images (pandal_id, coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid))
WHERE is_primary = true;

CREATE TABLE IF NOT EXISTS public.pandal_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
  source_url TEXT,
  source_type TEXT,
  source_title TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pandal_id UUID NOT NULL REFERENCES public.pandals(id) ON DELETE CASCADE,
  season_id UUID REFERENCES public.puja_seasons(id) ON DELETE SET NULL,
  field_group TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  verified_at TIMESTAMPTZ,
  verified_by UUID, -- References profiles(id), will be added later if needed
  source_count INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS pandal_categories_category_idx ON public.pandal_categories (category_id);
CREATE INDEX IF NOT EXISTS pandal_tags_tag_idx ON public.pandal_tags (tag_id);
CREATE INDEX IF NOT EXISTS pandal_years_pandal_season_idx ON public.pandal_years (pandal_id, season_id);
CREATE INDEX IF NOT EXISTS pandal_sources_pandal_idx ON public.pandal_sources (pandal_id);
