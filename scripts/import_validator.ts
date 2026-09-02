import * as fs from 'fs';
import * as path from 'path';

interface PandalData {
  legacy_id?: string;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  category?: string;
}

interface ImportData {
  metadata: {
    total_pandals: number;
    year: number;
  };
  pandals: PandalData[];
}

export function validateImportData(filePath: string): boolean {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data: ImportData = JSON.parse(rawData);

    console.log(`Validating data from: ${filePath}`);
    console.log(`Metadata declared total: ${data.metadata.total_pandals}`);
    console.log(`Actual array length: ${data.pandals.length}`);

    // 1. Validate Record Count Match (CRITICAL RULE from Part 73)
    if (data.metadata.total_pandals !== data.pandals.length) {
      console.error(`❌ FATAL ERROR: Metadata count (${data.metadata.total_pandals}) does not match actual array length (${data.pandals.length}).`);
      console.error('Do NOT silently reconcile mismatches. Aborting import.');
      return false;
    }

    // 2. Duplicate Detection
    const slugs = new Set<string>();
    const legacyIds = new Set<string>();

    let hasDuplicates = false;
    for (const p of data.pandals) {
      if (!p.slug) {
        console.error(`❌ ERROR: Pandal missing slug: ${p.name}`);
        hasDuplicates = true;
        continue;
      }
      if (slugs.has(p.slug)) {
        console.error(`❌ ERROR: Duplicate slug found: ${p.slug}`);
        hasDuplicates = true;
      }
      slugs.add(p.slug);

      if (p.legacy_id) {
        if (legacyIds.has(p.legacy_id)) {
          console.error(`❌ ERROR: Duplicate legacy_id found: ${p.legacy_id}`);
          hasDuplicates = true;
        }
        legacyIds.add(p.legacy_id);
      }
      
      // Basic coordinate validation
      if (p.latitude !== undefined && p.longitude !== undefined) {
        if (p.latitude < -90 || p.latitude > 90) {
           console.error(`❌ ERROR: Invalid latitude for ${p.slug}: ${p.latitude}`);
           hasDuplicates = true;
        }
        if (p.longitude < -180 || p.longitude > 180) {
           console.error(`❌ ERROR: Invalid longitude for ${p.slug}: ${p.longitude}`);
           hasDuplicates = true;
        }
      }
    }

    if (hasDuplicates) {
      console.error('❌ Validation failed due to duplicate keys or invalid data.');
      return false;
    }

    console.log('✅ Validation passed. Ready for import.');
    return true;

  } catch (err) {
    console.error('❌ Failed to parse or read import file:', err);
    return false;
  }
}

// If run directly via CLI
const args = process.argv.slice(2);
if (args.length > 0) {
  const targetFile = path.resolve(args[0]);
  const isValid = validateImportData(targetFile);
  if (!isValid) process.exit(1);
}
