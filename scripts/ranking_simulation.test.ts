// KIRTI — Statistical Ranking Simulation Tests
// Run with: npx ts-node scripts/ranking_simulation.test.ts

// Simulated Wilson Lower Bound function matching PostgreSQL
function calculateWilsonLowerBound(mean: number, n: number): number {
  const p = (mean - 1) / 4;
  const z = 1.96;
  const z2 = z * z;
  const denominator = 1 + z2 / n;
  const center = p + z2 / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  const L = (center - spread) / denominator;
  return L * 4 + 1;
}

// Simulated Bayesian Mean matching PostgreSQL
function calculateBayesianMean(mean: number, n: number, priorMean: number, priorStrength: number): number {
  return ((n / (n + priorStrength)) * mean) + ((priorStrength / (n + priorStrength)) * priorMean);
}

// Full Ranking Score
function calculateRankingScore(rawMean: number, n: number, priorMean: number = 3.0, priorStrength: number = 5.0): number {
  const bayesian = calculateBayesianMean(rawMean, n, priorMean, priorStrength);
  const wilson = calculateWilsonLowerBound(rawMean, n);
  const lambda = 0.70; // 70% Wilson, 30% Bayesian
  return (lambda * wilson) + ((1 - lambda) * bayesian);
}

// Test Suites
function runInvariantTests() {
  console.log("=== KIRTI STATISTICAL RANKING INVARIANT TESTS ===\n");

  const priorMean = 3.0;
  const priorStrength = 10.0; // Assume a higher prior strength for testing

  // Test 1: Small perfect vs Large very good
  const scoreSmallPerfect = calculateRankingScore(5.0, 5, priorMean, priorStrength);
  const scoreLargeGood = calculateRankingScore(4.7, 5000, priorMean, priorStrength);
  
  console.log("Test 1: Small perfect (5.0/5) vs Large very good (4.7/5000)");
  console.log(`Small Perfect Score: ${scoreSmallPerfect.toFixed(4)}`);
  console.log(`Large Good Score:    ${scoreLargeGood.toFixed(4)}`);
  if (scoreLargeGood > scoreSmallPerfect) {
    console.log("✅ PASS: Large good pandal correctly outranks small perfect pandal.\n");
  } else {
    console.error("❌ FAIL: Small perfect beat large good.\n");
  }

  // Test 2: Mass 1-star attack resistance
  // An established pandal with 4.8 from 2000 users vs a mass 1-star attack of 100 users
  const establishedMean = 4.8;
  const establishedN = 2000;
  const scoreBeforeAttack = calculateRankingScore(establishedMean, establishedN, priorMean, priorStrength);
  
  const newN = establishedN + 100;
  const newMean = ((establishedMean * establishedN) + (1.0 * 100)) / newN;
  const scoreAfterAttack = calculateRankingScore(newMean, newN, priorMean, priorStrength);

  console.log("Test 2: Mass 1-star attack (100 1-stars on a 4.8/2000 pandal)");
  console.log(`Score Before: ${scoreBeforeAttack.toFixed(4)}`);
  console.log(`Score After:  ${scoreAfterAttack.toFixed(4)} (Drop of ${(scoreBeforeAttack - scoreAfterAttack).toFixed(4)})`);
  console.log(`Raw mean dropped to ${newMean.toFixed(4)}`);
  
  if (scoreBeforeAttack - scoreAfterAttack < 0.3) {
     console.log("✅ PASS: Ranking engine is resilient to small-scale brigading.\n");
  } else {
     console.error("❌ FAIL: Excessive drop due to brigading.\n");
  }

  // Test 3: Convergence
  const scoreSmall = calculateRankingScore(4.5, 10, priorMean, priorStrength);
  const scoreMed = calculateRankingScore(4.5, 100, priorMean, priorStrength);
  const scoreLarge = calculateRankingScore(4.5, 10000, priorMean, priorStrength);

  console.log("Test 3: Convergence towards raw mean as n increases (Raw = 4.5)");
  console.log(`n=10:    ${scoreSmall.toFixed(4)}`);
  console.log(`n=100:   ${scoreMed.toFixed(4)}`);
  console.log(`n=10000: ${scoreLarge.toFixed(4)}`);

  if (scoreSmall < scoreMed && scoreMed < scoreLarge && scoreLarge > 4.45) {
     console.log("✅ PASS: Uncertainty bounds tighten properly with sample size.\n");
  } else {
     console.error("❌ FAIL: Did not converge correctly.\n");
  }
}

// Run the tests
runInvariantTests();
