-- ==============================================================================
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
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('heritage_bonedi_bari', 'Heritage / Bonedi Bari', 'ঐতিহ্য / বনেদি বাড়ি', 'Traditional family or historic aristocratic puja', 'discovery', true)
ON CONFLICT (code) DO NOTHING;
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('famous_landmark', 'Famous Landmark Puja', 'বিখ্যাত ল্যান্ডমার্ক পূজা', 'Widely recognized iconic Kolkata pujas', 'discovery', true)
ON CONFLICT (code) DO NOTHING;
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('theme_pandal', 'Theme Pandal', 'থিম মণ্ডপ', 'Strong artistic or conceptual theme', 'discovery', true)
ON CONFLICT (code) DO NOTHING;
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('artistic_experimental', 'Artistic / Experimental', 'শিল্পকলা / পরীক্ষামূলক', 'Unconventional design, installations, contemporary art', 'discovery', true)
ON CONFLICT (code) DO NOTHING;
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('traditional_bengali', 'Traditional Bengali', 'সাবেকীয়ানা', 'Strongly rooted in traditional Bengali puja aesthetics', 'discovery', true)
ON CONFLICT (code) DO NOTHING;
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('grand_spectacular', 'Grand / Spectacular', 'জাঁকজমক', 'Known for scale, architecture, lighting, or visual grandeur', 'discovery', true)
ON CONFLICT (code) DO NOTHING;
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('community_favourite', 'Community Favourite', 'পাড়ার প্রিয়', 'Popular neighbourhood/community pujas', 'discovery', true)
ON CONFLICT (code) DO NOTHING;
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('hidden_gem', 'Hidden Gem', 'লুকোনো রত্ন', 'Less famous but highly interesting or distinctive', 'discovery', true)
ON CONFLICT (code) DO NOTHING;
INSERT INTO categories (code, name, name_bn, description, category_group, is_active)
VALUES ('cultural_historical', 'Cultural / Historical', 'সাংস্কৃতিক / ঐতিহাসিক', 'Strong cultural, historical, or heritage importance', 'discovery', true)
ON CONFLICT (code) DO NOTHING;

-- 4. SEED PANDALS & LOCATIONS

-- Pandal: Bagbazar Sarbojanin Durgotsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'famous_landmark' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('bagbazar-sarbojanin', 'Bagbazar Sarbojanin Durgotsab', 'বাগবাজার সার্বজনীন দুর্গোৎসব', 'bagbazar-sarbojanin', 'Bagbazar Sarbojanin Durgotsab Committee', 'One of Kolkata''s oldest and most iconic sarbojanin (community) Durga Pujas. Founded in 1919, Bagbazar Sarbojanin is renowned for its traditional Daker Saaj (pith decoration) on the idol and its authentic old-world Bengali Puja atmosphere near the Hooghly riverbank.', 'Among the pioneering community Durga Pujas that made the festival accessible beyond wealthy families. Known for strict adherence to traditional rituals.', 1919, 'historic_community_puja', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Near Bagbazar Launch Ghat, Bagbazar, Kolkata, West Bengal 700003', 'Bagbazar', 'Bagbazar', 22.5985, 88.362, 'high', 'https://www.google.com/maps/search/?api=1&query=Bagbazar+Sarbojanin+Durgotsab+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Located near Bagbazar Launch Ghat on the Hooghly. Walking distance from Sovabazar-Sutanuti Metro.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Kumartuli Park Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'artistic_experimental' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('kumartuli-park', 'Kumartuli Park Durga Puja', 'কুমারটুলি পার্ক দুর্গাপূজা', 'kumartuli-park', 'Kumartuli Park Durga Puja Committee', 'Located in the heart of Kolkata''s legendary potters'' quarter (Kumartuli), this puja is celebrated for its innovative fusion of traditional idol-making craft with contemporary artistic themes.', 'Set in the traditional artisan quarter where Durga idols have been sculpted for centuries.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Banamali Sarkar Street, Kumartuli, Kolkata, West Bengal 700005', 'Kumartuli', 'Hatkhola', 22.596, 88.361, 'high', 'https://www.google.com/maps/search/?api=1&query=Kumartuli+Park+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Walking distance from Sovabazar-Sutanuti Metro. Best visited with Bagbazar and Ahiritola.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Ahiritola Sarbojanin Durgotsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'famous_landmark' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('ahiritola-sarbojanin', 'Ahiritola Sarbojanin Durgotsab', 'আহিরীটোলা সার্বজনীন দুর্গোৎসব', 'ahiritola-sarbojanin', 'Ahiritola Sarbojanin Durgotsab Committee', 'A long-standing traditional puja near Bagbazar that balances traditional values with artistic, theme-based decorations and rich cultural programs.', 'One of the venerable community pujas of North Kolkata.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '55, B.K. Pal Avenue, Ahiritola, Kolkata, West Bengal 700005', 'Ahiritola', 'Ahiritola', 22.5945, 88.3635, 'high', 'https://www.google.com/maps/search/?api=1&query=Ahiritola+Sarbojanin+Durgotsab+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '5-7 min walk from Sovabazar-Sutanuti Metro. Near B.K. Pal Avenue.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: College Square Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'central' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'famous_landmark' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('college-square', 'College Square Durga Puja', 'কলেজ স্কোয়ার দুর্গাপূজা', 'college-square', 'College Square Durga Puja Committee', 'Iconic Durga Puja celebrated beside the historic College Square tank. The reflection of the brilliantly illuminated pandal on the water creates one of the most photographed scenes of Kolkata Puja.', 'Set beside the historic College Square swimming tank surrounded by educational institutions.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'College Square, College Street, Kolkata, West Bengal 700073', 'College Street', 'College Square', 22.5766, 88.3632, 'high', 'https://www.google.com/maps/search/?api=1&query=College+Square+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Mahatma Gandhi Road Metro. The water reflection at night is iconic.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Hatibagan Sarbojanin Durgotsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'famous_landmark' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('hatibagan-sarbojanin', 'Hatibagan Sarbojanin Durgotsab', 'হাতিবাগান সার্বজনীন দুর্গোৎসব', 'hatibagan-sarbojanin', 'Hatibagan Sarbojanin Durgotsab Committee', 'A landmark puja in the heart of North Kolkata, known for balancing traditional roots with impressive large-scale themes.', 'One of the oldest community pujas in the historic Hatibagan theatre district.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Hatibagan, Bidhan Sarani, Kolkata, West Bengal 700006', 'Hatibagan', 'Hatibagan', 22.587, 88.369, 'medium', 'https://www.google.com/maps/search/?api=1&query=Hatibagan+Sarbojanin+Durgotsab+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Bidhan Sarani. Accessible from Shyambazar Metro.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Manicktala Chaltabagan Lohapatty
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('manicktala-chaltabagan', 'Manicktala Chaltabagan Lohapatty', 'মানিকতলা চালতাবাগান লোহাপট্টি', 'manicktala-chaltabagan', 'Manicktala Chaltabagan Lohapatty Durga Puja Committee', 'A legendary puja started in 1943, widely acclaimed for its unique artistic setups and consistently award-winning decorations. Known for creative blends of nature and heritage.', 'One of the pioneering theme pujas, established during the independence movement era.', 1943, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Chaltabagan, Manicktala, Kolkata, West Bengal 700054', 'Manicktala', 'Chaltabagan', 22.583, 88.377, 'medium', 'https://www.google.com/maps/search/?api=1&query=Manicktala+Chaltabagan+Lohapatty+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Founded 1943. Near Manicktala crossing.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Kashi Bose Lane Sarbojanin Durgotsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('kashi-bose-lane', 'Kashi Bose Lane Sarbojanin Durgotsab', 'কাশী বোস লেন সার্বজনীন দুর্গোৎসব', 'kashi-bose-lane', 'Kashi Bose Lane Sarbojanin Durgotsab Committee', 'Renowned for its creative and socially relevant themes that often carry strong messages about contemporary social issues.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Kashi Bose Lane, Nalin Sarkar Street, Shyambazar, Kolkata, West Bengal 700004', 'Shyambazar', 'Nalin Sarkar Street', 22.59, 88.366, 'medium', 'https://www.google.com/maps/search/?api=1&query=Kashi+Bose+Lane+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Nalin Sarkar Street area. Accessible from Shyambazar Metro.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Sikdar Bagan Sadharan Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'traditional_bengali' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('sikdar-bagan', 'Sikdar Bagan Sadharan Durga Puja', 'সিকদার বাগান সাধারণ দুর্গাপূজা', 'sikdar-bagan', 'Sikdar Bagan Sadharan Durga Puja Committee', 'Celebrated for its authentic, traditional atmosphere, representing the quintessential old Kolkata neighbourhood puja experience.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Sikdar Bagan Street, Shyambazar, Kolkata, West Bengal 700004', 'Shyambazar', 'Sikdar Bagan', 22.588, 88.368, 'medium', 'https://www.google.com/maps/search/?api=1&query=Sikdar+Bagan+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Tala Prattay
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'artistic_experimental' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('tala-prattay', 'Tala Prattay', 'তালা প্রত্যয়', 'tala-prattay', 'Tala Prattay Club', 'Widely celebrated for its avant-garde and highly sophisticated artistic themes that push creative boundaries.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Tala, Kolkata, West Bengal 700037', 'Tala', 'Tala', 22.589, 88.375, 'medium', 'https://www.google.com/maps/search/?api=1&query=Tala+Prattay+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Known for pushing artistic boundaries in North Kolkata.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Santosh Mitra Square (Lebutala Park)
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'central' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'grand_spectacular' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('santosh-mitra-square', 'Santosh Mitra Square (Lebutala Park)', 'সন্তোষ মিত্র স্কোয়ার (লেবুতলা পার্ক)', 'santosh-mitra-square', 'Santosh Mitra Square Durga Puja Committee', 'One of the most famous and high-budget pandals in Kolkata, Santosh Mitra Square is known for its grand, intricate theme installations that frequently feature massive recreations of famous monuments and architectural wonders.', 'A staple of Kolkata Puja culture, consistently pushing the boundaries of scale and ambition.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Natabar Dutta Row, Lebutala, Bowbazar, Kolkata, West Bengal 700014', 'Bowbazar', 'Lebutala', 22.5659, 88.3656, 'high', 'https://www.google.com/maps/search/?api=1&query=Santosh+Mitra+Square+Lebutala+Park+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Sealdah railway station. Wikipedia coordinates verified: 22.5659°N, 88.3656°E.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Mohammad Ali Park Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'central' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'famous_landmark' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('mohammad-ali-park', 'Mohammad Ali Park Durga Puja', 'মোহাম্মদ আলী পার্ক দুর্গাপূজা', 'mohammad-ali-park', 'Mohammad Ali Park Youth Association', 'A prestigious and historic Durga Puja venue on Chittaranjan Avenue, known since 1969 for its creative architectural themes and elaborate decorations.', 'One of Central Kolkata''s most enduring puja traditions, running since 1969.', 1969, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Mohammad Ali Park, Chittaranjan Avenue, College Square, Kolkata, West Bengal 700073', 'College Street', 'Chittaranjan Avenue', 22.5772, 88.3607, 'high', 'https://www.google.com/maps/search/?api=1&query=Mohammad+Ali+Park+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'On Chittaranjan Avenue near College Square. Coordinates from Tripopola/Wikimapia.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Deshapriya Park Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'grand_spectacular' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('deshapriya-park', 'Deshapriya Park Durga Puja', 'দেশপ্রিয় পার্ক দুর্গাপূজা', 'deshapriya-park', 'Deshapriya Park Puja Committee', 'One of South Kolkata''s most famous pujas, known for its massive scale and ambitious, trend-setting themed installations that attract visitors from across the city.', 'A defining force in the theme puja movement of South Kolkata.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '34A, Manoharpukur Road, Deshapriya Park, Kolkata, West Bengal 700029', 'Deshapriya Park', 'Manoharpukur Road', 22.5183, 88.3537, 'high', 'https://www.google.com/maps/search/?api=1&query=Deshapriya+Park+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Wikipedia coordinates: 22.5183°N, 88.3537°E. Near Rash Behari Avenue and Priya Cinema.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Ekdalia Evergreen Club
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('ekdalia-evergreen', 'Ekdalia Evergreen Club', 'একডালিয়া এভারগ্রীন ক্লাব', 'ekdalia-evergreen', 'Ekdalia Evergreen Club', 'Famous for grand recreations of famous Indian temples and magnificent lighting. Ekdalia Evergreen is a perennial fixture of South Kolkata''s puja circuit.', 'Among the pioneering theme pandals of South Kolkata.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '15, Ekdalia Road, Ballygunge, Kolkata, West Bengal 700019', 'Ballygunge', 'Ekdalia', 22.5209, 88.3658, 'high', 'https://www.google.com/maps/search/?api=1&query=Ekdalia+Evergreen+Club+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '15 Ekdalia Road, off Gariahat Road. Coordinates from Wikimedia.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Suruchi Sangha
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('suruchi-sangha', 'Suruchi Sangha', 'সুরুচি সংঘ', 'suruchi-sangha', 'Suruchi Sangha', 'One of the most famous theme pujas in Kolkata, Suruchi Sangha is renowned for its culturally authentic themes that highlight the heritage, art, or social landscape of different Indian states and regions.', 'Established in 1952. A pioneer of the cultural-theme puja movement.', 1952, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '500 & 505, Block M, New Alipore, Kolkata, West Bengal 700053', 'New Alipore', 'New Alipore Block M', 22.506, 88.335, 'medium', 'https://www.google.com/maps/search/?api=1&query=Suruchi+Sangha+New+Alipore+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Block M, New Alipore. Official website: suruchisangha.com')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Chetla Agrani Club
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'artistic_experimental' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('chetla-agrani', 'Chetla Agrani Club', 'চেতলা অগ্রণী ক্লাব', 'chetla-agrani', 'Chetla Agrani Club', 'A flagship puja in South Kolkata known for its immense grandeur and cutting-edge thematic innovation, often using unique materials and immersive storytelling.', 'A leading force in contemporary art-based puja installations.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '14, Peary Mohan Roy Road, Chetla, Kolkata, West Bengal 700027', 'Chetla', 'Chetla', 22.514, 88.342, 'medium', 'https://www.google.com/maps/search/?api=1&query=Chetla+Agrani+Club+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '14 Peary Mohan Roy Road. Official website: chetlaagraniclub.com')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Mudiali Club
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('mudiali-club', 'Mudiali Club', 'মুদিয়ালী ক্লাব', 'mudiali-club', 'Mudiali Club', 'A must-visit puja near Rabindra Sarobar, known for its blend of modern creativity and classic artistic standards.', 'One of the oldest and most prominent Durga Puja committees in South Kolkata.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '3, Rajani Sen Road, Kalighat, Kolkata, West Bengal 700026', 'Kalighat', 'Mudiali', 22.512, 88.344, 'medium', 'https://www.google.com/maps/search/?api=1&query=Mudiali+Club+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '3 Rajani Sen Road, near Rabindra Sarobar. Near Rabindra Sarobar Metro.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Singhi Park Sarbojanin Durgotsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'famous_landmark' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('singhi-park', 'Singhi Park Sarbojanin Durgotsab', 'সিংহি পার্ক সার্বজনীন দুর্গোৎসব', 'singhi-park', 'Singhi Park Sarbojanin Durgotsab Committee', 'One of the oldest and most respected pujas in South Kolkata, celebrated for its traditional grandeur and impressive idol artistry.', 'Among the original stalwarts of South Kolkata community pujas.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '5, Ramani Chatterjee Road, Ballygunge, Kolkata, West Bengal 700029', 'Ballygunge', 'Dover Lane', 22.522, 88.362, 'medium', 'https://www.google.com/maps/search/?api=1&query=Singhi+Park+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '5 Ramani Chatterjee Road, near Dover Lane off Gariahat Road.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Tridhara Sammilani
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'artistic_experimental' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('tridhara-sammilani', 'Tridhara Sammilani', 'ত্রিধারা সম্মিলনী', 'tridhara-sammilani', 'Tridhara Sammilani', 'Known for sophisticated, artistic pandals and unique contemporary concepts in the heart of South Kolkata.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '107, Manoharpukur Road, Kalighat, Kolkata, West Bengal 700029', 'Kalighat', 'Manoharpukur Road', 22.5196, 88.3556, 'high', 'https://www.google.com/maps/search/?api=1&query=Tridhara+Sammilani+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '107 Manoharpukur Road. Official website: tridhara.org. Coordinates from Mapcarta.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Ballygunge Cultural Association
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'famous_landmark' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('ballygunge-cultural', 'Ballygunge Cultural Association', 'বালিগঞ্জ কালচারাল অ্যাসোসিয়েশন', 'ballygunge-cultural', 'Ballygunge Cultural Association', 'A staple of South Kolkata Pujo with a reputation for consistent high-quality decor and thematic presentations.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '20, Lake View Road, Lake Terrace, Kalighat, Kolkata, West Bengal 700029', 'Kalighat', 'Lake View Road', 22.517, 88.353, 'medium', 'https://www.google.com/maps/search/?api=1&query=Ballygunge+Cultural+Association+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '20 Lake View Road, near Lake Market/Kalighat.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Samaj Sebi Sangha
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('samaj-sebi-sangha', 'Samaj Sebi Sangha', 'সমাজসেবী সংঘ', 'samaj-sebi-sangha', 'Samaj Sebi Sangha', 'Highly regarded for its aesthetic and often socially conscious themes.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '24A, Lake View Road, Kolkata, West Bengal 700029', 'Kalighat', 'Lake View Road', 22.5165, 88.3525, 'medium', 'https://www.google.com/maps/search/?api=1&query=Samaj+Sebi+Sangha+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '24A Lake View Road, near Lake Market. Official website: samajsebi.com')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Jodhpur Park Saradiya Utsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('jodhpur-park', 'Jodhpur Park Saradiya Utsab', 'যোধপুর পার্ক শারদীয় উৎসব', 'jodhpur-park', 'Jodhpur Park Saradiya Utsab Committee', 'Extremely popular for its innovative pandal structures and massive crowds. A major crowd-puller in South Kolkata.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '1/D, Jodhpur Park, Kolkata, West Bengal 700068', 'Jodhpur Park', 'Jodhpur Park', 22.505, 88.359, 'medium', 'https://www.google.com/maps/search/?api=1&query=Jodhpur+Park+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '1/D Jodhpur Park.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Hindustan Park Sarbojanin Durgotsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('hindustan-park', 'Hindustan Park Sarbojanin Durgotsab', 'হিন্দুস্থান পার্ক সার্বজনীন দুর্গোৎসব', 'hindustan-park', 'Hindustan Park Sarbojanin Committee', 'A prominent community puja near Gol Park, opposite Basanti Devi College. Known for its mix of tradition and creative themes.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '51/1, Hindustan Park, Gol Park, Dhakuria, Kolkata, West Bengal 700029', 'Dhakuria', 'Hindustan Park', 22.5145, 88.363, 'medium', 'https://www.google.com/maps/search/?api=1&query=Hindustan+Park+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '51/1 Hindustan Park, opposite Basanti Devi College.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Badamtala Ashar Sangha
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('badamtala-ashar-sangha', 'Badamtala Ashar Sangha', 'বাদামতলা আশার সংঘ', 'badamtala-ashar-sangha', 'Badamtala Ashar Sangha', 'Celebrated for unique, thought-provoking themes and creative excellence near Kalighat.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Badamtala, Kalighat, Kolkata, West Bengal 700026', 'Kalighat', 'Badamtala', 22.5175, 88.347, 'medium', 'https://www.google.com/maps/search/?api=1&query=Badamtala+Ashar+Sangha+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Badamtala area near Kalighat.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Bhawanipore 75 Pally
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('bhawanipore-75-pally', 'Bhawanipore 75 Pally', 'ভবানীপুর ৭৫ পল্লী', 'bhawanipore-75-pally', 'Bhawanipore 75 Pally Durga Puja Committee', 'A very prominent and prestigious community puja in Bhawanipore, famous for its intricate pandal designs and cultural/social narrative themes.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Bhawanipore, Kolkata, West Bengal 700025', 'Bhawanipore', 'Bhawanipore', 22.525, 88.347, 'low', 'https://www.google.com/maps/search/?api=1&query=Bhawanipore+75+Pally+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Coordinates approximate — exact pandal location within Bhawanipore needs manual verification.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: 66 Pally Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('66-pally', '66 Pally Durga Puja', '৬৬ পল্লী দুর্গাপূজা', '66-pally', '66 Pally Durga Puja Committee', 'A well-known community puja in the Bhawanipore area, often visited on the same circuit as 75 Pally.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '66 Pally, Bhawanipore, Kolkata, West Bengal 700025', 'Bhawanipore', 'Bhawanipore', 22.524, 88.346, 'low', 'https://www.google.com/maps/search/?api=1&query=66+Pally+Durga+Puja+Bhawanipore+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Approximate coordinates. Needs manual verification.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Naktala Udayan Sangha
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('naktala-udayan-sangha', 'Naktala Udayan Sangha', 'নাকতলা উদয়ন সংঘ', 'naktala-udayan-sangha', 'Naktala Udayan Sangha', 'One of the most prominent pujas in South Kolkata, consistently recognized for its socially reflective and highly artistic themes.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '1/250, Krisanu Dey Sarani, Naktala, Garia, Kolkata, West Bengal 700047', 'Naktala', 'Garia', 22.468, 88.372, 'high', 'https://www.google.com/maps/search/?api=1&query=Naktala+Udayan+Sangha+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '1/250 Krisanu Dey Sarani, behind Naktala High School. ~800m from Gitanjali Metro.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Bosepukur Sitala Mandir
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('bosepukur-sitala-mandir', 'Bosepukur Sitala Mandir', 'বোসপুকুর শীতলা মন্দির', 'bosepukur-sitala-mandir', 'Bosepukur Sitala Mandir Committee', 'A pioneer in theme-based pujas in the Kasba region, consistently ranked among the top must-visit spots in South Kolkata.', 'On the grounds of the historic Sitala Mandir temple.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '1/27, Bose Pukur Road, Tal Bagan, Bosepukur, Kasba, Kolkata, West Bengal 700042', 'Kasba', 'Bosepukur', 22.494, 88.378, 'medium', 'https://www.google.com/maps/search/?api=1&query=Bosepukur+Sitala+Mandir+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '1/27 Bose Pukur Road, Kasba.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Santoshpur Lake Pally
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('santoshpur-lake-pally', 'Santoshpur Lake Pally', 'সন্তোষপুর লেক পল্লী', 'santoshpur-lake-pally', 'Santoshpur Lake Pally Durga Puja Committee', 'One of the most famous pujas in the Santoshpur area, known for elaborate themes and artistic excellence.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Lake Terrace, Lake West Road, Santoshpur, Kolkata, West Bengal 700075', 'Santoshpur', 'Santoshpur', 22.485, 88.384, 'medium', 'https://www.google.com/maps/search/?api=1&query=Santoshpur+Lake+Pally+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Joda Bridge, Santoshpur.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Rajdanga Naba Uday Sangha
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'grand_spectacular' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('rajdanga-naba-uday', 'Rajdanga Naba Uday Sangha', 'রাজডাঙা নব উদয় সংঘ', 'rajdanga-naba-uday', 'Rajdanga Naba Uday Sangha', 'Highly regarded for its grand scale and high-production thematic displays in the Kasba/Rajdanga area.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Rajdanga Main Road, Rajdanga, Kasba, Kolkata, West Bengal 700107', 'Kasba', 'Rajdanga', 22.499, 88.383, 'medium', 'https://www.google.com/maps/search/?api=1&query=Rajdanga+Naba+Uday+Sangha+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near EM Bypass Connector, Kasba area.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Sreebhumi Sporting Club
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'east' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'grand_spectacular' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('sreebhumi-sporting-club', 'Sreebhumi Sporting Club', 'শ্রীভূমি স্পোর্টিং ক্লাব', 'sreebhumi-sporting-club', 'Sreebhumi Sporting Club', 'Widely considered one of the biggest crowd-pullers in Kolkata. Famous for massive, opulent themes — often replicating iconic palaces or temples from across India — with glittering light displays that draw millions.', 'Has become a modern landmark of Kolkata Puja culture for its sheer scale.', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '198, Canal Street, Sreebhumi, Lake Town, South Dumdum, Kolkata, West Bengal 700048', 'Lake Town', 'Sreebhumi', 22.6003, 88.4025, 'high', 'https://www.google.com/maps/search/?api=1&query=Sreebhumi+Sporting+Club+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '198 Canal Street, Sreebhumi. Coordinates from Wikimapia: 22°36''01"N 88°24''09"E. Near Lake Town Police Station.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Lake Town Adhibasi Brinda
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'east' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('lake-town-adhibasi-brinda', 'Lake Town Adhibasi Brinda', 'লেক টাউন আদিবাসী বৃন্দ', 'lake-town-adhibasi-brinda', 'Lake Town Adhibasi Brinda', 'Known for focusing on themes related to social awareness, rural life, and cultural heritage, offering a more grounded and meaningful festive atmosphere.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Lake Town, South Dumdum, Kolkata, West Bengal 700048', 'Lake Town', 'Lake Town', 22.598, 88.401, 'medium', 'https://www.google.com/maps/search/?api=1&query=Lake+Town+Adhibasi+Brinda+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Lake Town area, near Sreebhumi.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Dum Dum Park Tarun Sangha
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'east' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('dum-dum-park-tarun-sangha', 'Dum Dum Park Tarun Sangha', 'দমদম পার্ক তরুণ সংঘ', 'dum-dum-park-tarun-sangha', 'Dum Dum Park Tarun Sangha', 'A perennial crowd-puller known for its creative, vibrant themes and artistic displays.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Dum Dum Park, Dum Dum, Kolkata, West Bengal 700055', 'Dum Dum', 'Dum Dum Park', 22.61, 88.395, 'medium', 'https://www.google.com/maps/search/?api=1&query=Dum+Dum+Park+Tarun+Sangha+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Dum Dum Park area.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Dum Dum Park Bharat Chakra
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'east' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('dum-dum-park-bharat-chakra', 'Dum Dum Park Bharat Chakra', 'দমদম পার্ক ভারতচক্র', 'dum-dum-park-bharat-chakra', 'Dum Dum Park Bharat Chakra', 'Highly regarded for its unique and innovative pandal concepts in the Dum Dum area.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Dum Dum Park, Dum Dum, Kolkata, West Bengal 700055', 'Dum Dum', 'Dum Dum Park', 22.611, 88.394, 'medium', 'https://www.google.com/maps/search/?api=1&query=Dum+Dum+Park+Bharat+Chakra+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Dum Dum Park, close to Tarun Sangha.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: FD Block Salt Lake Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'east' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('salt-lake-fd-block', 'FD Block Salt Lake Durga Puja', 'এফডি ব্লক সল্টলেক দুর্গাপূজা', 'salt-lake-fd-block', 'FD Block Puja Committee, Salt Lake', 'One of the most famous and highly-rated pandals in Salt Lake, known for elaborate and creative thematic displays in a family-friendly environment.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'FD Block, Sector III, Salt Lake City, Kolkata, West Bengal 700106', 'Salt Lake', 'FD Block, Sector III', 22.575, 88.415, 'medium', 'https://www.google.com/maps/search/?api=1&query=FD+Block+Salt+Lake+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'FD Block, Sector III Salt Lake.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: AE Block Salt Lake Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'east' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('salt-lake-ae-block', 'AE Block Salt Lake Durga Puja', 'এই ব্লক সল্টলেক দুর্গাপূজা', 'salt-lake-ae-block', 'AE Block Puja Committee, Salt Lake', 'A well-known block puja in Salt Lake Sector II, praised for being family-friendly and well-managed.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'AE Block, Sector II, Salt Lake City, Kolkata, West Bengal 700064', 'Salt Lake', 'AE Block, Sector II', 22.578, 88.41, 'low', 'https://www.google.com/maps/search/?api=1&query=AE+Block+Salt+Lake+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'AE Block, Sector II Salt Lake. Approximate location.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Barisha Club Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('barisha-club', 'Barisha Club Durga Puja', 'বড়িশা ক্লাব দুর্গাপূজা', 'barisha-club', 'Barisha Club', 'One of the most iconic pujas in the Behala-Barisha region, consistently praised for its socially conscious and highly innovative themes.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '5 & 8, Santosh Roy Road, Sakherbazar, Barisha, Kolkata, West Bengal 700008', 'Barisha', 'Sakherbazar', 22.45, 88.313, 'medium', 'https://www.google.com/maps/search/?api=1&query=Barisha+Club+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '5 & 8 Santosh Roy Road, Sakherbazar area.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Behala Nutan Dal
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'theme_pandal' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('behala-nutan-dal', 'Behala Nutan Dal', 'বেহালা নতুন দল', 'behala-nutan-dal', 'Behala Nutan Dal', 'Known for ambitious, globally inspired themes. Considered a must-visit for those who appreciate thoughtful and artistic pandal designs.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Near Behala 14 No. Bus Stand, Behala, Kolkata, West Bengal 700034', 'Behala', 'Behala 14 No. Bus Stand', 22.465, 88.312, 'medium', 'https://www.google.com/maps/search/?api=1&query=Behala+Nutan+Dal+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Behala 14 No. Bus Stand.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Haridevpur 41 Pally
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'grand_spectacular' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('haridevpur-41-pally', 'Haridevpur 41 Pally', 'হরিদেবপুর ৪১ পল্লী', 'haridevpur-41-pally', 'Haridevpur 41 Pally Durga Puja Committee', 'One of the most popular and non-negotiable stops in South Kolkata for pandal hoppers. Famous for grand-scale thematic presentations and meticulous execution.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '41 Pally, Haridevpur, Kolkata, West Bengal 700082', 'Haridevpur', 'Haridevpur', 22.455, 88.33, 'medium', 'https://www.google.com/maps/search/?api=1&query=Haridevpur+41+Pally+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Haridevpur area.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Santoshpur Trikon Park
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('santoshpur-trikon-park', 'Santoshpur Trikon Park', 'সন্তোষপুর ত্রিকোণ পার্ক', 'santoshpur-trikon-park', 'Santoshpur Trikon Park Durga Puja Committee', 'A well-known community puja in the Santoshpur area that attracts large crowds.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Trikon Park, Santoshpur, Kolkata, West Bengal 700075', 'Santoshpur', 'Santoshpur', 22.487, 88.387, 'low', 'https://www.google.com/maps/search/?api=1&query=Santoshpur+Trikon+Park+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Approximate location in Santoshpur.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Alipore Sarbajanin Durgotsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('alipore-sarbajanin', 'Alipore Sarbajanin Durgotsab', 'আলিপুর সার্বজনীন দুর্গোৎসব', 'alipore-sarbajanin', 'Alipore Sarbajanin Committee', 'A landmark puja in the Alipore area, recognized for its longstanding tradition and elegant celebrations.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Alipore Road, Alipore, Kolkata, West Bengal 700027', 'Alipore', 'Alipore', 22.529, 88.333, 'low', 'https://www.google.com/maps/search/?api=1&query=Alipore+Sarbajanin+Durgotsab+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Approximate location in Alipore.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: New Town Sarbojanin Durgotsav
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'east' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('new-town-sarbojanin', 'New Town Sarbojanin Durgotsav', 'নিউ টাউন সার্বজনীন দুর্গোৎসব', 'new-town-sarbojanin', 'New Town Sarbojanin Durgotsav Committee', 'The flagship Durga Puja celebration for the New Town township near the Clock Tower. Features contemporary themes and modern organization.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Near Clock Tower, City Square, New Town, Rajarhat, Kolkata, West Bengal 700156', 'New Town', 'Rajarhat', 22.587, 88.462, 'medium', 'https://www.google.com/maps/search/?api=1&query=New+Town+Sarbojanin+Durgotsav+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Clock Tower, New Town.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Belgachia Sadharan Durgotsab
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('belgachia-sadharan', 'Belgachia Sadharan Durgotsab', 'বেলগাছিয়া সাধারণ দুর্গোৎসব', 'belgachia-sadharan', 'Belgachia Sadharan Durgotsab Committee', 'A well-known community puja in the Belgachia area of North Kolkata.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Belgachia, Kolkata, West Bengal 700037', 'Belgachia', 'Belgachia', 22.59, 88.38, 'low', 'https://www.google.com/maps/search/?api=1&query=Belgachia+Sadharan+Durgotsab+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Near Belgachia Metro station. Approximate coordinates.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Cossipore Shakti Sangha
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('cossipore-shakti-sangha', 'Cossipore Shakti Sangha', 'কসিপুর শক্তি সংঘ', 'cossipore-shakti-sangha', 'Cossipore Shakti Sangha', 'A recognized community puja in the Cossipore area of North Kolkata.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Cossipore, Kolkata, West Bengal 700002', 'Cossipore', 'Cossipore', 22.602, 88.368, 'low', 'https://www.google.com/maps/search/?api=1&query=Cossipore+Shakti+Sangha+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Cossipore area. Approximate coordinates.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Arjunpur Amra Sabai
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'east' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('arjunpur-amra-sabai', 'Arjunpur Amra Sabai', 'অর্জুনপুর আমরা সবাই', 'arjunpur-amra-sabai', 'Arjunpur Amra Sabai', 'A popular puja destination in the Dum Dum locality drawing significant visitors for its themes.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Arjunpur, Dum Dum, Kolkata, West Bengal 700055', 'Dum Dum', 'Arjunpur', 22.613, 88.393, 'low', 'https://www.google.com/maps/search/?api=1&query=Arjunpur+Amra+Sabai+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Arjunpur area, Dum Dum.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Bhabanipore Abasar
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'hidden_gem' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('bhabanipore-abasar', 'Bhabanipore Abasar', 'ভবানীপুর আবাসর', 'bhabanipore-abasar', 'Bhabanipore Abasar', 'Often creates dreamy, imaginative themes that feel more like immersive art installations than traditional pandals.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Bhawanipore, Kolkata, West Bengal 700025', 'Bhawanipore', 'Bhawanipore', 22.526, 88.348, 'low', 'https://www.google.com/maps/search/?api=1&query=Bhabanipore+Abasar+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Bhawanipore area. Known as a hidden gem.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Nalin Sarkar Street Sarbojanin
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'hidden_gem' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('nalin-sarkar-street', 'Nalin Sarkar Street Sarbojanin', 'নলিন সরকার স্ট্রিট সার্বজনীন', 'nalin-sarkar-street', 'Nalin Sarkar Street Sarbojanin Durgotsab Committee', 'A breath of fresh air in North Kolkata, known for its creative blend of nature and heritage, and idols crafted with unique pottery styles.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Nalin Sarkar Street, Shyambazar, Kolkata, West Bengal 700004', 'Shyambazar', 'Nalin Sarkar Street', 22.589, 88.367, 'medium', 'https://www.google.com/maps/search/?api=1&query=Nalin+Sarkar+Street+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Nalin Sarkar Street, Shyambazar area.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Sovabazar Rajbari Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('sovabazar-rajbari', 'Sovabazar Rajbari Durga Puja', 'শোভাবাজার রাজবাড়ি দুর্গাপূজা', 'sovabazar-rajbari', 'Raja Nabakrishna Deb Family', 'One of Kolkata''s most historic and famous Bonedi Bari pujas, founded by Raja Nabakrishna Deb in 1757 following the Battle of Plassey. Known for once hosting British dignitaries like Lord Clive and Warren Hastings.', 'Founded 1757 by Raja Nabakrishna Deb. One of the earliest Durga Pujas to be held in Kolkata. Connected to the British colonial history of Bengal. The puja is held at two separate locations (Borotorof and Chototorof).', 1757, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '36, Raja Nabakrishna Street, Sovabazar, Kolkata, West Bengal 700005', 'Sovabazar', 'Sovabazar', 22.593, 88.361, 'high', 'https://www.google.com/maps/search/?api=1&query=Sovabazar+Rajbari+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Raja Nabakrishna Street, Sovabazar. Near Sovabazar-Sutanuti Metro. Heritage Grade structure.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Khelat Chandra Ghosh Bari (Pathuriaghata)
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('khelat-chandra-ghosh-bari', 'Khelat Chandra Ghosh Bari (Pathuriaghata)', 'খেলাৎচন্দ্র ঘোষ বাড়ি (পাথুরিয়াঘাটা)', 'khelat-chandra-ghosh-bari', 'Khelat Chandra Ghosh Family', 'Established around 1855 by Babu Khelat Chandra Ghosh, a noted philanthropist. The mansion (Khelat Bhawan) is a Grade I heritage structure, famous for its long majestic thakur dalan, Belgian chandeliers, and deep association with Indian classical music.', 'Grade I heritage structure. Famous for its Belgian chandeliers and association with Indian classical music and dance. Established circa 1855.', 1855, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Pathuriaghata, Kolkata, West Bengal 700006', 'Pathuriaghata', 'Pathuriaghata', 22.586, 88.364, 'medium', 'https://www.google.com/maps/search/?api=1&query=Khelat+Chandra+Ghosh+Bari+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Pathuriaghata area. Grade I heritage structure.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Laha Bari Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('laha-bari', 'Laha Bari Durga Puja', 'লাহা বাড়ি দুর্গাপূজা', 'laha-bari', 'Laha Family', 'Initiated by Bhagabati Charan Laha over two centuries ago. Known for its unique idol where the Goddess is traditionally not depicted in the standard Mahishasuramardini form. The puja rotates between different family branches.', 'Over 200 years old. Unique non-Mahishasuramardini idol tradition. Rotating family celebration.', NULL, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Pathuriaghata, Kolkata, West Bengal 700006', 'Pathuriaghata', 'Pathuriaghata / Bidhan Sarani', 22.5855, 88.365, 'medium', 'https://www.google.com/maps/search/?api=1&query=Laha+Bari+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Pathuriaghata area. Puja rotates between branches including Bidhan Sarani and Muktaram Babu Street.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Sabarna Roy Choudhury Aatchala Bari
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('sabarna-roy-choudhury', 'Sabarna Roy Choudhury Aatchala Bari', 'সাবর্ণ রায়চৌধুরী আটচালা বাড়ি', 'sabarna-roy-choudhury', 'Sabarna Roy Choudhury Paribar Parishad', 'Widely regarded as the oldest Durga Puja in the Kolkata region, initiated in 1610 by Lakshmikanta Gangopadhyay (Roy Choudhury). One of the first Saparivara Durga Pujas. Today 8 separate pujas are held by family branches — 6 in Barisha, 1 in Birati, 1 in Nimta.', 'Oldest known Durga Puja in the Kolkata region (1610). Started by prominent zamindar family. Sabarna Sangrahashala (museum) at the site. Multiple family branch pujas including Aatchala Bari, Baro Bari, Mejo Bari, Benaki Bari, Kalikinkar Bhawan, and Majher Bari.', 1610, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '67/3, Diamond Harbour Road, Barisha, Kolkata, West Bengal 700008', 'Barisha', 'Barisha', 22.448, 88.31, 'medium', 'https://www.google.com/maps/search/?api=1&query=Sabarna+Roy+Choudhury+Barisha+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '67/3 Diamond Harbour Road, Barisha. Saptarshi Bhawan. Museum on site. 8 branch pujas total.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Jorasanko Daw Bari Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('jorasanko-daw-bari', 'Jorasanko Daw Bari Durga Puja', 'জোড়াসাঁকো দাও বাড়ি দুর্গাপূজা', 'jorasanko-daw-bari', 'Daw Family, Jorasanko', 'Famous for its ''Bandookwala'' (gun-toting) family tradition, traditional Daker Saaj (pith decoration), and the ceremonial cannon fire during Sandhi Puja.', 'Historic Jorasanko neighbourhood. Unique cannon-fire tradition at Sandhi Puja.', NULL, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Jorasanko, Kolkata, West Bengal 700007', 'Jorasanko', 'Jorasanko', 22.585, 88.359, 'medium', 'https://www.google.com/maps/search/?api=1&query=Jorasanko+Daw+Bari+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Jorasanko area near Girish Park.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Darjipara Mitra Bari Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('darjipara-mitra-bari', 'Darjipara Mitra Bari Durga Puja', 'দর্জিপাড়া মিত্র বাড়ি দুর্গাপূজা', 'darjipara-mitra-bari', 'Mitra Family, Darjipara', 'A highly traditional puja established in 1807, known for its adherence to strict, ancient rituals.', 'Established 1807. Known for strict adherence to ancient ritual protocols.', 1807, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Darjipara, Kolkata, West Bengal 700006', 'Darjipara', 'North Kolkata', 22.587, 88.363, 'low', 'https://www.google.com/maps/search/?api=1&query=Darjipara+Mitra+Bari+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Darjipara area. Approximate coordinates.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Thanthania Dutta Bari Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'central' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('thanthania-dutta-bari', 'Thanthania Dutta Bari Durga Puja', 'ঠনঠনিয়া দত্ত বাড়ি দুর্গাপূজা', 'thanthania-dutta-bari', 'Dutta Family, Thanthania', 'Celebrated since 1855, this family puja is cherished for its intimate, spiritual atmosphere.', 'Established 1855. Known for intimate spiritual atmosphere.', 1855, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Thanthania, Kolkata, West Bengal 700004', 'Thanthania', 'Central Kolkata', 22.58, 88.36, 'low', 'https://www.google.com/maps/search/?api=1&query=Thanthania+Dutta+Bari+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Thanthania area, Central Kolkata. Approximate coordinates.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Bhukailash Rajbari Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('bhukailash-rajbari', 'Bhukailash Rajbari Durga Puja', 'ভূকৈলাশ রাজবাড়ি দুর্গাপূজা', 'bhukailash-rajbari', 'Ghoshal Family, Khidderpore', 'Founded by Raja Jaynarayan Ghoshal in the 18th century, set within a historic palace complex in Khidderpore.', '18th century palace complex. Raja Jaynarayan Ghoshal family.', NULL, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Bhukailash, Khidderpore, Kolkata, West Bengal 700023', 'Khidderpore', 'Khidderpore', 22.533, 88.325, 'medium', 'https://www.google.com/maps/search/?api=1&query=Bhukailash+Rajbari+Khidderpore+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Bhukailash area, Khidderpore.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Behala Jagat Ram Mukherjee Bari
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('behala-jagat-ram-mukherjee', 'Behala Jagat Ram Mukherjee Bari', 'বেহালা জগৎরাম মুখার্জী বাড়ি', 'behala-jagat-ram-mukherjee', 'Jagat Ram Mukherjee Family, Behala', 'Famous for its unique ''Sonar Durga'' (Golden Durga) idol.', 'Known for its unique golden idol tradition.', NULL, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Behala, Kolkata, West Bengal 700034', 'Behala', 'Behala', 22.46, 88.315, 'low', 'https://www.google.com/maps/search/?api=1&query=Behala+Jagat+Ram+Mukherjee+Bari+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Behala area. Known for golden idol.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Rani Rashmoni Bari (Janbazar)
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'central' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('rani-rashmoni-bari', 'Rani Rashmoni Bari (Janbazar)', 'রানী রাসমণি বাড়ি (জানবাজার)', 'rani-rashmoni-bari', 'Rani Rashmoni Family', 'The ancestral home of Rani Rashmoni, the legendary philanthropist and founder of Dakshineswar Kali Temple. Her family''s Durga Puja continues as a significant heritage tradition.', 'Home of Rani Rashmoni (1793-1861), one of the most important figures in Bengal''s history. Connected to Dakshineswar Kali Temple legacy.', NULL, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Rani Rashmoni Road, Janbazar, Kolkata, West Bengal 700017', 'Janbazar', 'Central Kolkata', 22.559, 88.354, 'medium', 'https://www.google.com/maps/search/?api=1&query=Rani+Rashmoni+Bari+Janbazar+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Rani Rashmoni Road, Janbazar, near Esplanade.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Bhowanipore Mallick Bari
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('bhowanipore-mallick-bari', 'Bhowanipore Mallick Bari', 'ভবানীপুর মল্লিক বাড়ি', 'bhowanipore-mallick-bari', 'Mallick Family, Bhowanipore', 'A traditional Bonedi Bari puja in Bhawanipore, offering an intimate look at aristocratic family Durga Puja traditions.', 'Historic Bhawanipore family tradition.', NULL, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Bhawanipore, Kolkata, West Bengal 700025', 'Bhawanipore', 'Bhawanipore', 22.528, 88.345, 'low', 'https://www.google.com/maps/search/?api=1&query=Bhowanipore+Mallick+Bari+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Bhawanipore area. Approximate coordinates.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Chhatubabu Latubabur Bari
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'north' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'heritage_bonedi_bari' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('chhatubabu-latubabur-bari', 'Chhatubabu Latubabur Bari', 'ছাতুবাবু-লাটুবাবুর বাড়ি', 'chhatubabu-latubabur-bari', 'Dey Family', 'A famous Bonedi Bari puja near Beadon Street, known for its historic courtyard puja and music patronage.', 'Famous aristocratic mansion with deep connections to Bengali cultural history.', NULL, 'bonedi_bari', 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Beadon Street, Kolkata, West Bengal 700006', 'Beadon Street', 'North Kolkata', 22.584, 88.366, 'medium', 'https://www.google.com/maps/search/?api=1&query=Chhatubabu+Latubabur+Bari+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Beadon Street area, North Kolkata.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: 95 Pally Durga Puja
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('95-pally', '95 Pally Durga Puja', '৯৫ পল্লী দুর্গাপূজা', '95-pally', '95 Pally Durga Puja Committee', 'A prominent community puja near Jodhpur Park area.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, '70A, Rahim Ostagar Road, Kolkata, West Bengal 700033', 'Jodhpur Park', 'Rahim Ostagar Road', 22.502, 88.357, 'medium', 'https://www.google.com/maps/search/?api=1&query=95+Pally+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', '70A Rahim Ostagar Road.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Khidderpore Jubak Sangha Club
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('khidderpore-jubak-sangha', 'Khidderpore Jubak Sangha Club', 'খিদিরপুর যুবক সংঘ ক্লাব', 'khidderpore-jubak-sangha', 'Khidderpore Jubak Sangha Club', 'A well-known organization in the Kidderpore area hosting a popular and long-standing community Durga Puja.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Khidderpore, Kolkata, West Bengal 700023', 'Khidderpore', 'Khidderpore', 22.535, 88.322, 'low', 'https://www.google.com/maps/search/?api=1&query=Khidderpore+Jubak+Sangha+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Kidderpore area. Approximate coordinates.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Santoshpur Avenue South
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('santoshpur-avenue-south', 'Santoshpur Avenue South', 'সন্তোষপুর অ্যাভিনিউ সাউথ', 'santoshpur-avenue-south', 'Santoshpur Avenue South Durga Puja Committee', 'Often recognized for innovative, socially relevant themes depicting local life and street culture.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Santoshpur Avenue South, Santoshpur, Kolkata, West Bengal 700075', 'Santoshpur', 'Santoshpur', 22.486, 88.385, 'low', 'https://www.google.com/maps/search/?api=1&query=Santoshpur+Avenue+South+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Santoshpur area.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Kendua Shanti Sangha
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('kendua-shanti-sangha', 'Kendua Shanti Sangha', 'কেন্দুয়া শান্তি সংঘ', 'kendua-shanti-sangha', 'Kendua Shanti Sangha', 'A community puja in the Kendua area of Garia.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Kendua, Garia, Kolkata, West Bengal 700084', 'Garia', 'Kendua', 22.462, 88.383, 'low', 'https://www.google.com/maps/search/?api=1&query=Kendua+Shanti+Sangha+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Kendua, Garia area. Approximate coordinates.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Behala Friends Club
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('behala-friends-club', 'Behala Friends Club', 'বেহালা ফ্রেন্ডস ক্লাব', 'behala-friends-club', 'Behala Friends Club', 'A long-standing, traditional yet modern puja in Behala known for its vibrant atmosphere and larger-than-life idols.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Behala, Kolkata, West Bengal 700034', 'Behala', 'Behala', 22.468, 88.31, 'low', 'https://www.google.com/maps/search/?api=1&query=Behala+Friends+Club+Durga+Puja+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Behala area.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

-- Pandal: Ajeyo Sanghati (Haridevpur)
DO $$
DECLARE
  v_pandal_id UUID;
  v_zone_id UUID;
  v_cat_id UUID;
  v_season_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM puja_seasons WHERE year = 2026 LIMIT 1;
  SELECT id INTO v_zone_id FROM zones WHERE code = 'south' LIMIT 1;
  SELECT id INTO v_cat_id FROM categories WHERE code = 'community_favourite' LIMIT 1;

  INSERT INTO pandals (legacy_id, name, name_bn, slug, committee_name, description, historical_significance, founded_year, heritage_status, status)
  VALUES ('ajeyo-sanghati', 'Ajeyo Sanghati (Haridevpur)', 'অজেয় সংহতি (হরিদেবপুর)', 'ajeyo-sanghati', 'Ajeyo Sanghati Club', 'A prominent club in the Haridevpur circuit, known for its creative pandal work and festive spirit.', '', NULL, NULL, 'active')
  ON CONFLICT (legacy_id) DO UPDATE 
  SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now()
  RETURNING id INTO v_pandal_id;

  INSERT INTO pandal_locations (pandal_id, zone_id, address, neighbourhood, locality, latitude, longitude, coordinate_confidence, google_maps_url, city, state, country)
  VALUES (v_pandal_id, v_zone_id, 'Haridevpur, Kolkata, West Bengal 700082', 'Haridevpur', 'Haridevpur', 22.454, 88.331, 'low', 'https://www.google.com/maps/search/?api=1&query=Ajeyo+Sanghati+Haridevpur+Kolkata', 'Kolkata', 'West Bengal', 'India')
  ON CONFLICT (pandal_id) DO UPDATE
  SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, address = EXCLUDED.address, updated_at = now();

  IF v_cat_id IS NOT NULL THEN
    INSERT INTO pandal_categories (pandal_id, category_id, is_primary)
    VALUES (v_pandal_id, v_cat_id, true)
    ON CONFLICT (pandal_id, category_id) DO NOTHING;
  END IF;

  INSERT INTO pandal_years (pandal_id, season_id, theme, notes)
  VALUES (v_pandal_id, v_season_id, '', 'Haridevpur area.')
  ON CONFLICT (pandal_id, season_id) DO NOTHING;
END $$;

COMMIT;
