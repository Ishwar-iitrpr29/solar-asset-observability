import React, { useState } from 'react';
import { generateInsights, analyzeAssetPerformance, Insight } from '../services/insightService';

interface TestDataset {
  name: string;
  assetId: string;
  performanceHistory: { [date: string]: number };
}

/**
 * Interactive Insight Tester Component
 * Test how different datasets generate different insights
 */
export const InsightTester: React.FC = () => {
  // Predefined test datasets
  const testDatasets: { [key: string]: TestDataset } = {
    critical: {
      name: '🔴 Critical Drop (15.8%)',
      assetId: 'L17_LT1_INV1_CRITICAL',
      performanceHistory: {
        '2024-08-01': 0.009500,
        '2024-08-02': 0.009450,
        '2024-08-03': 0.009400,
        '2024-08-04': 0.009200,
        '2024-08-05': 0.009000,
        '2024-08-06': 0.008800,
        '2024-08-07': 0.008500,
        '2024-08-08': 0.008200,
        '2024-08-09': 0.008100,
        '2024-08-10': 0.008000,
      },
    },
    warning: {
      name: '🟠 Warning Decline (6.2%)',
      assetId: 'L17_LT1_INV2_WARNING',
      performanceHistory: {
        '2024-08-01': 0.009500,
        '2024-08-02': 0.009450,
        '2024-08-03': 0.009400,
        '2024-08-04': 0.009350,
        '2024-08-05': 0.009300,
        '2024-08-06': 0.009250,
        '2024-08-07': 0.009200,
        '2024-08-08': 0.009150,
        '2024-08-09': 0.009100,
        '2024-08-10': 0.009000,
      },
    },
    improvement: {
      name: '🔵 Improvement (8.5%)',
      assetId: 'L17_LT1_INV3_IMPROVE',
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
        '2024-08-10': 0.009220,
      },
    },
    anomaly: {
      name: '⚠️ Anomaly Detected',
      assetId: 'L17_LT1_INV4_ANOMALY',
      performanceHistory: {
        '2024-08-01': 0.009500,
        '2024-08-02': 0.009480,
        '2024-08-03': 0.009490,
        '2024-08-04': 0.009510,
        '2024-08-05': 0.009520,
        '2024-08-06': 0.004800,
        '2024-08-07': 0.009450,
        '2024-08-08': 0.009470,
        '2024-08-09': 0.009480,
        '2024-08-10': 0.009500,
      },
    },
    lowPR: {
      name: '📉 Low PR Value (0.65%)',
      assetId: 'L17_LT1_INV5_LOWPR',
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
    },
    normal: {
      name: '✅ Normal Operation',
      assetId: 'L17_LT1_INV6_NORMAL',
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
        '2024-08-10': 0.009500,
      },
    },
  };

  const [selectedDataset, setSelectedDataset] = useState<string>('critical');
  const [customAssetId, setCustomAssetId] = useState('');
  const [customData, setCustomData] = useState('');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isCustom, setIsCustom] = useState(false);

  const handleTestDataset = (key: string) => {
    setSelectedDataset(key);
    setIsCustom(false);
    const dataset = testDatasets[key];
    generateTestInsights(dataset.assetId, dataset.performanceHistory);
  };

  const handleCustomData = () => {
    if (!customAssetId.trim() || !customData.trim()) {
      alert('Please fill in both Asset ID and Performance Data');
      return;
    }

    try {
      // Parse the custom data
      // Expected format: "2024-08-01:0.009,2024-08-02:0.008" or JSON
      let performanceHistory: { [date: string]: number } = {};

      if (customData.includes('{')) {
        // JSON format
        performanceHistory = JSON.parse(customData);
      } else if (customData.includes(':')) {
        // CSV format: date:value,date:value
        const pairs = customData.split(',');
        pairs.forEach(pair => {
          const [date, value] = pair.trim().split(':');
          if (date && value) {
            performanceHistory[date] = parseFloat(value);
          }
        });
      } else {
        alert('Invalid format. Use either:\n- CSV: "2024-08-01:0.009,2024-08-02:0.008"\n- JSON: {"2024-08-01": 0.009}');
        return;
      }

      if (Object.keys(performanceHistory).length === 0) {
        alert('No valid data points found');
        return;
      }

      setIsCustom(true);
      generateTestInsights(customAssetId, performanceHistory);
    } catch (error) {
      alert(`Error parsing data: ${error}`);
    }
  };

  const generateTestInsights = (assetId: string, history: { [date: string]: number }) => {
    const sortedDates = Object.keys(history).sort();
    const lastDate = sortedDates[sortedDates.length - 1];
    const currentPR = history[lastDate];

    const analysisResult = analyzeAssetPerformance(history);
    setAnalysis(analysisResult);

    const generatedInsights = generateInsights(assetId, currentPR, history, lastDate);
    setInsights(generatedInsights);
  };

  const currentDataset = testDatasets[selectedDataset];

  return (
    <div className="insight-tester-container">
      <div className="tester-header">
        <h2>🧪 AI Insights Interactive Tester</h2>
        <p>Select a dataset or create your own to see how insights are generated</p>
      </div>

      <div className="tester-layout">
        {/* LEFT PANEL: Dataset Selection */}
        <div className="tester-panel tester-datasets">
          <h3>Test Datasets</h3>
          <div className="dataset-buttons">
            {Object.entries(testDatasets).map(([key, dataset]) => (
              <button
                key={key}
                className={`dataset-btn ${selectedDataset === key && !isCustom ? 'active' : ''}`}
                onClick={() => handleTestDataset(key)}
              >
                {dataset.name}
              </button>
            ))}
          </div>

          <div className="custom-data-section">
            <h4>Or Create Custom Dataset</h4>
            <div className="custom-inputs">
              <input
                type="text"
                placeholder="Asset ID (e.g., L17_LT1_INV_TEST)"
                value={customAssetId}
                onChange={(e) => setCustomAssetId(e.target.value)}
                className="custom-input"
              />
              <textarea
                placeholder="Performance Data (CSV or JSON)&#10;&#10;CSV: 2024-08-01:0.009,2024-08-02:0.008&#10;JSON: {&quot;2024-08-01&quot;: 0.009}"
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                className="custom-textarea"
              />
              <button onClick={handleCustomData} className="custom-btn">
                Test Custom Data
              </button>
            </div>

            <div className="data-format-help">
              <p><strong>CSV Format:</strong></p>
              <code>2024-08-01:0.009,2024-08-02:0.008,2024-08-03:0.007</code>
              <p><strong>JSON Format:</strong></p>
              <code>{`{"2024-08-01": 0.009, "2024-08-02": 0.008}`}</code>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Results */}
        <div className="tester-panel tester-results">
          {insights.length > 0 ? (
            <>
              <h3>📊 Analysis Results</h3>

              {/* Analysis Summary */}
              <div className="analysis-summary">
                <div className="summary-item">
                  <span className="summary-label">Asset ID:</span>
                  <span className="summary-value">
                    {isCustom ? customAssetId : currentDataset?.assetId}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Trend:</span>
                  <span className="summary-value">
                    {analysis?.trend.toUpperCase()}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Change:</span>
                  <span className={`summary-value ${analysis?.changePercentage < 0 ? 'negative' : 'positive'}`}>
                    {analysis?.changePercentage.toFixed(2)}%
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Anomalies:</span>
                  <span className="summary-value">
                    {analysis?.anomalyDetected ? '⚠️ Detected' : '✓ None'}
                  </span>
                </div>
              </div>

              <hr />

              {/* Insights */}
              <div className="insights-container">
                <h4>💡 Generated Insights ({insights.length})</h4>
                {insights.map((insight, idx) => (
                  <div key={insight.id} className={`insight-result insight-${insight.severity}`}>
                    <div className="insight-result-header">
                      <span className="insight-number">{idx + 1}</span>
                      <span className="insight-severity">{insight.severity.toUpperCase()}</span>
                      <span className="insight-title-text">{insight.title}</span>
                    </div>
                    <div className="insight-result-body">
                      <p className="insight-desc">{insight.description}</p>
                      <div className="insight-recommendation-box">
                        <strong>🔧 Recommendation:</strong>
                        <p>{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>Select a dataset or create custom data to see insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightTester;
