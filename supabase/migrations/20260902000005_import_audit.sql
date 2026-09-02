-- ==============================================================================
-- KIRTI — MIGRATION 005: IMPORT & AUDIT
-- Contains: Import Batches, Raw Import Records
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. IMPORT BATCHES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_name TEXT NOT NULL,
  dataset_version TEXT,
  source_filename TEXT,
  source_record_count INTEGER,
  imported_record_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'validated')),
  validation_errors JSONB,
  validation_warnings JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. RAW IMPORT RECORDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raw_import_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id UUID NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  source_record_id TEXT,
  raw_data JSONB NOT NULL,
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'warning')),
  validation_errors JSONB,
  validation_warnings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS raw_import_batch_idx ON public.raw_import_records (import_batch_id);
CREATE INDEX IF NOT EXISTS raw_import_source_id_idx ON public.raw_import_records (source_record_id);
