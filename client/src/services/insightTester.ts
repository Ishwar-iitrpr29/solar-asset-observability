/**
 * AI Insights Agent - Interactive Dataset Tester
 * 
 * Usage:
 * 1. Uncomment the test case you want to run
 * 2. Run: npm run test:insights (in client directory)
 * 3. View the generated insights in console
 * 4. Modify datasets to test different scenarios
 */

import { generateInsights, analyzeAssetPerformance, Insight } from './insightService';

// =============================================================================
// DATASET TEMPLATES - Edit these to test different scenarios
// =============================================================================

/**
 * CRITICAL SCENARIO: Asset with severe performance drop
 * Edit this dataset to test critical alerts
 */
const DATASET_CRITICAL = {
  performanceHistory: {
    '2024-08-01': 0.009500,
    '2024-08-02': 0.009450,
    '2024-08-03': 0.009400,
    '2024-08-04': 0.009300,
    '2024-08-05': 0.009200,
    '2024-08-06': 0.009000,
    '2024-08-07': 0.008800,
    '2024-08-08': 0.008500, // Major drop starts
    '2024-08-09': 0.008200,
    '2024-08-10': 0.008000,
  },
  assetId: 'L17_LT1_INV1',
  currentDate: '2024-08-10',
  description: 'Critical: 15.8% performance drop - investigate immediately',
};

/**
 * WARNING SCENARIO: Moderate performance decline
 * Edit this dataset to test warning alerts
 */
const DATASET_WARNING = {
  performanceHistory: {
    '2024-08-01': 0.009500,
    '2024-08-02': 0.009480,
    '2024-08-03': 0.009450,
    '2024-08-04': 0.009400,
    '2024-08-05': 0.009350,
    '2024-08-06': 0.009300,
    '2024-08-07': 0.009250,
    '2024-08-08': 0.009200,
    '2024-08-09': 0.009100,
    '2024-08-10': 0.009000, // 5.3% decline
  },
  assetId: 'L17_LT1_INV2',
  currentDate: '2024-08-10',
  description: 'Warning: 5.3% moderate decline - monitor closely',
};

/**
 * IMPROVEMENT SCENARIO: Asset getting better
 * Edit this dataset to test positive trends
 */
const DATASET_IMPROVEMENT = {
  performanceHistory: {
    '2024-08-01': 0.008500,
    '2024-08-02': 0.008600,
    '2024-08-03': 0.008700,
    '2024-08-04': 0.008800,
    '2024-08-05': 0.008900,
    '2024-08-06': 0.009000,
    '2024-08-07': 0.009100,
    '2024-08-08': 0.009200,
    '2024-08-09': 0.009300,
    '2024-08-10': 0.009400, // 10.6% improvement
  },
  assetId: 'L17_LT1_INV3',
  currentDate: '2024-08-10',
  description: 'Info: 10.6% improvement - excellent performance trend',
};

/**
 * ANOMALY SCENARIO: Unusual patterns detected
 * Edit this dataset to test anomaly detection
 */
const DATASET_ANOMALY = {
  performanceHistory: {
    '2024-08-01': 0.009500,
    '2024-08-02': 0.009480,
    '2024-08-03': 0.009490,
    '2024-08-04': 0.009510,
    '2024-08-05': 0.009520,
    '2024-08-06': 0.004800, // ANOMALY - sudden drop
    '2024-08-07': 0.009450,
    '2024-08-08': 0.009470,
    '2024-08-09': 0.009480,
    '2024-08-10': 0.009500,
  },
  assetId: 'L17_LT1_INV4',
  currentDate: '2024-08-10',
  description: 'Warning: Anomaly detected - unusual performance spike',
};

/**
 * LOW PR SCENARIO: Asset with consistently low efficiency
 * Edit this dataset to test low PR alerts
 */
const DATASET_LOW_PR = {
  performanceHistory: {
    '2024-08-01': 0.006500,
    '2024-08-02': 0.006600,
    '2024-08-03': 0.006550,
    '2024-08-04': 0.006700,
    '2024-08-05': 0.006450,
    '2024-08-06': 0.006600,
    '2024-08-07': 0.006500,
    '2024-08-08': 0.006550,
    '2024-08-09': 0.006480,
    '2024-08-10': 0.006520,
  },
  assetId: 'L17_LT1_INV5',
  currentDate: '2024-08-10',
  description: 'Warning: Consistently low PR values (0.65%) - investigate',
};

/**
 * NORMAL SCENARIO: Healthy asset with stable performance
 * Edit this dataset to test normal operation alerts
 */
const DATASET_NORMAL = {
  performanceHistory: {
    '2024-08-01': 0.009500,
    '2024-08-02': 0.009510,
    '2024-08-03': 0.009490,
    '2024-08-04': 0.009520,
    '2024-08-05': 0.009500,
    '2024-08-06': 0.009515,
    '2024-08-07': 0.009495,
    '2024-08-08': 0.009510,
    '2024-08-09': 0.009505,
    '2024-08-10': 0.009500, // Stable performance
  },
  assetId: 'L17_LT1_INV6',
  currentDate: '2024-08-10',
  description: 'Info: Stable performance - operating normally',
};

/**
 * CUSTOM SCENARIO: Create your own dataset here
 * Copy one of the templates above and modify the values
 */
const DATASET_CUSTOM = {
  performanceHistory: {
    '2024-08-01': 0.009500,
    '2024-08-02': 0.009500,
    '2024-08-03': 0.009500,
    '2024-08-04': 0.009500,
    // Add more dates here
  },
  assetId: 'L17_LT1_INV_CUSTOM',
  currentDate: '2024-08-04',
  description: 'Custom: Edit the values above to test your scenario',
};

// =============================================================================
// TEST RUNNER
// =============================================================================

interface TestDataset {
  performanceHistory: { [date: string]: number };
  assetId: string;
  currentDate: string;
  description: string;
}

/**
 * Run a single test with a dataset
 */
function runTest(dataset: TestDataset): void {
  console.log('\n' + '='.repeat(80));
  console.log(`📊 TEST: ${dataset.description}`);
  console.log('='.repeat(80));

  // Get the current PR (last value in history)
  const sortedDates = Object.keys(dataset.performanceHistory).sort();
  const lastDate = sortedDates[sortedDates.length - 1];
  const currentPR = dataset.performanceHistory[lastDate];

  // Analyze performance
  const analysis = analyzeAssetPerformance(dataset.performanceHistory);

  console.log(`\n📈 ANALYSIS:`);
  console.log(`   Asset ID:          ${dataset.assetId}`);
  console.log(`   Current PR:        ${currentPR.toFixed(6)} (${(currentPR * 100).toFixed(2)}%)`);
  console.log(`   Data Points:       ${sortedDates.length}`);
  console.log(`   Date Range:        ${sortedDates[0]} to ${lastDate}`);
  console.log(`   \n   Trend:             ${analysis.trend.toUpperCase()}`);
  console.log(`   Change %:          ${analysis.changePercentage.toFixed(2)}%`);
  console.log(`   Anomaly Detected:  ${analysis.anomalyDetected ? 'YES ⚠️' : 'NO ✓'}`);

  // Generate insights
  const insights = generateInsights(
    dataset.assetId,
    currentPR,
    dataset.performanceHistory,
    dataset.currentDate
  );

  console.log(`\n💡 INSIGHTS GENERATED: ${insights.length}`);
  console.log('-'.repeat(80));

  insights.forEach((insight, index) => {
    const severityEmoji = {
      critical: '🔴',
      warning: '🟠',
      info: '🔵',
    }[insight.severity];

    console.log(`\n${index + 1}. ${severityEmoji} [${insight.severity.toUpperCase()}] ${insight.title}`);
    console.log(`   ID: ${insight.id}`);
    console.log(`   \n   Description:`);
    console.log(`   ${insight.description}`);
    console.log(`   \n   Recommendation:`);
    console.log(`   ${insight.recommendation}`);
    console.log(`   \n   Timestamp: ${insight.timestamp.toLocaleString()}`);
  });

  console.log('\n' + '='.repeat(80));
}

/**
 * Run all predefined tests
 */
export function runAllTests(): void {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(15) + 'AI INSIGHTS AGENT - DATASET TESTING SUITE' + ' '.repeat(22) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  const datasets = [
    DATASET_CRITICAL,
    DATASET_WARNING,
    DATASET_IMPROVEMENT,
    DATASET_ANOMALY,
    DATASET_LOW_PR,
    DATASET_NORMAL,
  ];

  datasets.forEach((dataset, index) => {
    runTest(dataset);
    if (index < datasets.length - 1) {
      console.log('\n');
    }
  });

  console.log('\n✅ All tests completed!\n');
  console.log('TIP: Edit the DATASET_* constants above to test different scenarios.');
  console.log('Then run: npm run test:insights\n');
}

/**
 * Quick test a single dataset
 */
export function quickTest(dataset: TestDataset): void {
  runTest(dataset);
}

/**
 * Create a custom dataset and test it
 */
export function testCustom(
  assetId: string,
  performanceHistory: { [date: string]: number },
  currentDate: string
): void {
  const dataset: TestDataset = {
    assetId,
    performanceHistory,
    currentDate,
    description: `Custom test for ${assetId}`,
  };
  runTest(dataset);
}

// =============================================================================
// EXPORT DATASETS FOR DIRECT USE
// =============================================================================

export {
  DATASET_CRITICAL,
  DATASET_WARNING,
  DATASET_IMPROVEMENT,
  DATASET_ANOMALY,
  DATASET_LOW_PR,
  DATASET_NORMAL,
  DATASET_CUSTOM,
};

// =============================================================================
// DEMO: Uncomment below to test specific dataset when file is imported
// =============================================================================

// Uncomment ONE of these to test:
// runTest(DATASET_CRITICAL);           // Test critical alert
// runTest(DATASET_WARNING);              // Test warning alert
// runTest(DATASET_IMPROVEMENT);          // Test improvement alert
// runTest(DATASET_ANOMALY);              // Test anomaly detection
// runTest(DATASET_LOW_PR);               // Test low PR alert
// runTest(DATASET_NORMAL);               // Test normal operation
// runAllTests();                         // Run all tests at once

// Or create a custom test:
// testCustom('MY_ASSET', { '2024-08-01': 0.009, '2024-08-02': 0.008 }, '2024-08-02');

export default {
  runTest,
  runAllTests,
  quickTest,
  testCustom,
};
