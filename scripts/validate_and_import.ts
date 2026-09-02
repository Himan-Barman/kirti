/**
 * KIRTI — DATASET VALIDATION & PRE-IMPORT VERIFICATION PIPELINE
 * Validates data/pandals_master.json against production constraints before import.
 */

import fs from 'fs';
import path from 'path';

const DATASET_PATH = path.resolve('data/pandals_master.json');

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    declaredCount: number;
    actualPandalCount: number;
    validCoordinatesCount: number;
    clustersCount: number;
    categoriesCount: number;
    confidenceDistribution: { [key: string]: number };
  };
}

export function validateDataset(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const confidenceDistribution: { [key: string]: number } = { high: 0, medium: 0, low: 0, approximate: 0 };

  console.log('================================================================');
  console.log('🔍 KIRTI PRE-IMPORT DATASET INTEGRITY VALIDATION');
  console.log('================================================================');

  if (!fs.existsSync(DATASET_PATH)) {
    errors.push(`Dataset file not found at ${DATASET_PATH}`);
    return {
      passed: false,
      errors,
      warnings,
      metrics: { declaredCount: 0, actualPandalCount: 0, validCoordinatesCount: 0, clustersCount: 0, categoriesCount: 0, confidenceDistribution }
    };
  }

  const rawText = fs.readFileSync(DATASET_PATH, 'utf-8');
  let data: any;

  try {
    data = JSON.parse(rawText);
  } catch (err: any) {
    errors.push(`JSON Syntax Error: ${err.message}`);
    return {
      passed: false,
      errors,
      warnings,
      metrics: { declaredCount: 0, actualPandalCount: 0, validCoordinatesCount: 0, clustersCount: 0, categoriesCount: 0, confidenceDistribution }
    };
  }

  const { metadata, primary_categories, clusters, pandals } = data;

  // 1. RECORD COUNT VALIDATION (CRITICAL SPECIFICATION REQUIREMENT)
  const declaredCount = metadata?.total_pandals;
  const actualPandalCount = Array.isArray(pandals) ? pandals.length : 0;

  console.log(`Declared Records in Metadata : ${declaredCount}`);
  console.log(`Actual Parsed Records in Array: ${actualPandalCount}`);

  if (declaredCount !== actualPandalCount) {
    errors.push(
      `CRITICAL RECORD COUNT MISMATCH: metadata.total_pandals (${declaredCount}) does not match actual parsed pandal records (${actualPandalCount}). Data import must be rejected until dataset metadata is synchronized.`
    );
  }

  // 2. CATEGORY & TAXONOMY VALIDATION
  const validCategoryCodes = new Set((primary_categories || []).map((c: any) => c.id));
  console.log(`Primary Categories defined: ${validCategoryCodes.size}`);

  // 3. PANDAL INTEGRITY & COORDINATE CHECKS
  const seenLegacyIds = new Set<string>();
  const seenSlugs = new Set<string>();
  let validCoordinatesCount = 0;

  pandals.forEach((p: any, index: number) => {
    const recordLabel = `Pandal [${index + 1}] (${p.name || p.id || 'Unknown'})`;

    // Legacy ID uniqueness
    if (!p.id) {
      errors.push(`${recordLabel}: Missing required 'id' (legacy_id)`);
    } else if (seenLegacyIds.has(p.id)) {
      errors.push(`${recordLabel}: Duplicate legacy_id '${p.id}' found`);
    } else {
      seenLegacyIds.add(p.id);
    }

    // Slug
    const slug = p.slug || p.id;
    if (seenSlugs.has(slug)) {
      errors.push(`${recordLabel}: Duplicate slug '${slug}'`);
    } else {
      seenSlugs.add(slug);
    }

    // Name & Address
    if (!p.name || typeof p.name !== 'string') {
      errors.push(`${recordLabel}: Missing or invalid name`);
    }
    if (!p.address) {
      warnings.push(`${recordLabel}: Missing street address`);
    }

    // Coordinates validation (Latitude between -90 and 90, Longitude between -180 and 180)
    const lat = Number(p.latitude);
    const lng = Number(p.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      errors.push(`${recordLabel}: Non-numeric coordinates (${p.latitude}, ${p.longitude})`);
    } else if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      errors.push(`${recordLabel}: Coordinates out of global bounds (${lat}, ${lng})`);
    } else {
      // Kolkata metropolitan bounding box check (~22.0 to 23.0 N, 88.0 to 89.0 E)
      if (lat < 22.0 || lat > 23.0 || lng < 88.0 || lng > 89.0) {
        warnings.push(`${recordLabel}: Coordinates (${lat}, ${lng}) lie outside standard Kolkata perimeter bounds`);
      }
      validCoordinatesCount++;
    }

    // Confidence distribution
    const conf = (p.coordinate_confidence || 'medium').toLowerCase();
    confidenceDistribution[conf] = (confidenceDistribution[conf] || 0) + 1;

    // Primary Category reference check
    if (p.primary_category && !validCategoryCodes.has(p.primary_category)) {
      errors.push(`${recordLabel}: References unknown primary_category '${p.primary_category}'`);
    }
  });

  // 4. CLUSTER & ORDERING VALIDATION
  const clusterCount = Array.isArray(clusters) ? clusters.length : 0;
  (clusters || []).forEach((c: any) => {
    if (Array.isArray(c.pandal_ids)) {
      c.pandal_ids.forEach((pid: string) => {
        if (!seenLegacyIds.has(pid)) {
          warnings.push(`Cluster '${c.name}' references unknown pandal ID '${pid}'`);
        }
      });
    }
  });

  const passed = errors.length === 0;

  console.log('----------------------------------------------------------------');
  console.log(`Validation Results: ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`Total Errors  : ${errors.length}`);
  console.log(`Total Warnings: ${warnings.length}`);
  console.log('----------------------------------------------------------------');

  if (errors.length > 0) {
    console.log('\n❌ Validation Errors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    if (errors.length > 10) console.log(`  ... and ${errors.length - 10} more errors.`);
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ Validation Warnings:');
    warnings.slice(0, 5).forEach(w => console.log(`  - ${w}`));
    if (warnings.length > 5) console.log(`  ... and ${warnings.length - 5} more warnings.`);
  }

  return {
    passed,
    errors,
    warnings,
    metrics: {
      declaredCount,
      actualPandalCount,
      validCoordinatesCount,
      clustersCount: clusterCount,
      categoriesCount: validCategoryCodes.size,
      confidenceDistribution
    }
  };
}

// Run validation directly
validateDataset();
