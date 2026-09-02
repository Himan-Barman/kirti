/**
 * KIRTI — IDEMPOTENT DATABASE SEED GENERATOR
 * Generates clean, idempotent SQL statements from validated source data.
 */

import fs from 'fs';
import path from 'path';

const DATASET_PATH = path.resolve('data/pandals_master.json');
const OUTPUT_SQL_PATH = path.resolve('supabase_seed_data.sql');

export function generateSeedSQL() {
  const rawText = fs.readFileSync(DATASET_PATH, 'utf-8');
  const data = JSON.parse(rawText);

  const { primary_categories, clusters, pandals } = data;

  let sql = `-- ==============================================================================
-- KIRTI — PRODUCTION SEED DATA (IDEMPOTENT)
-- Generated automatically from data/pandals_master.json
-- ==============================================================================

BEGIN;

-- 1. SEED PUJA SEASON (2026 Active Season)
INSERT INTO puja_seasons (year, name, name_bn, is_current, is_active)
VALUES (2026, 'Durga Puja 2026', 'দুর্গাপূজা ২০২৬', true, true)
ON CONFLICT (year) DO UPDATE 
SET is_current = true, is_active = true, updated_at = now();

-- 2. SEED ZONES
INSERT INTO zones (code, name, name_bn)
VALUES 
  ('north', 'North Kolkata', 'উত্তর কলকাতা'),
  ('south', 'South Kolkata', 'দক্ষিণ কলকাতা'),
  ('central', 'Central Kolkata', 'মধ্য কলকাতা'),
  ('east', 'Salt Lake & East Kolkata', 'সল্টলেক ও পূর্ব কলকাতা'),
  ('west', 'Howrah & West', 'হাওড়া ও পশ্চিম')
ON CONFLICT (code) DO NOTHING;

-- 3. SEED PRIMARY CATEGORIES
`;

  (primary_categories || []).forEach((c: any) => {
    sql += `INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.name_bn.replace(/'/g, "''")}', '${(c.description || '').replace(/'/g, "''")}', 'discovery', true)
ON CONFLICT (code) DO NOTHING;\n`;
  });

  sql += `\n-- 4. SEED PANDALS & LOCATIONS\n`;

  (pandals || []).forEach((p: any) => {
    const slug = (p.slug || p.id).replace(/'/g, "''");
    const name = p.name.replace(/'/g, "''");
    const nameBn = (p.name_bn || '').replace(/'/g, "''");
    const desc = (p.description || '').replace(/'/g, "''");
    const hist = (p.historical_significance || '').replace(/'/g, "''");
    const committee = (p.committee_name || '').replace(/'/g, "''");
    const founded = p.founded_year ? parseInt(p.founded_year) : 'NULL';
    const heritage = p.heritage_status ? `'${p.heritage_status}'` : 'NULL';

    const lat = Number(p.latitude) || 22.5726;
    const lng = Number(p.longitude) || 88.3639;
    const addr = (p.address || `${name}, Kolkata`).replace(/'/g, "''");
    const hood = (p.neighbourhood || '').replace(/'/g, "''");
    const loc = (p.locality || '').replace(/'/g, "''");
    const conf = (p.coordinate_confidence || 'medium').replace(/'/g, "''");
    const mapsUrl = (p.google_maps_url || '').replace(/'/g, "''");

    const zoneCode = (p.zone || 'south').toLowerCase().includes('north') ? 'north' :
                     (p.zone || 'south').toLowerCase().includes('south') ? 'south' :
                     (p.zone || 'south').toLowerCase().includes('central') ? 'central' :
                     (p.zone || 'south').toLowerCase().includes('east') || (p.zone || 'south').toLowerCase().includes('salt') ? 'east' : 'south';

    sql += `
-- Pandal: ${name}
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = '${zoneCode}' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = '${p.primary_category || 'famous_landmark'}' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('${p.id}', '${name}', '${nameBn}', '${slug}', '${committee}', '${desc}', '${hist}', ${founded}, ${heritage}, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '${addr}', '${hood}', '${loc}', ${lat}, ${lng}, '${conf}', '${mapsUrl}', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '${(p.theme || '').replace(/'/g, "''")}', '${(p.notes || '').replace(/'/g, "''")}')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;
`;
  });

  sql += `\nCOMMIT;\n`;

  fs.writeFileSync(OUTPUT_SQL_PATH, sql, 'utf-8');
  console.log(`✅ Generated seed SQL with ${pandals.length} pandals at ${OUTPUT_SQL_PATH}`);
}

generateSeedSQL();
