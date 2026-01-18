/**
 * AI Insights Service
 * Analyzes solar asset performance data to generate actionable insights
 */

export interface Insight {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  affectedAsset?: string;
  timestamp: Date;
}

export interface PerformanceAnalysis {
  changePercentage: number;
  trend: 'improving' | 'declining' | 'stable';
  anomalyDetected: boolean;
}

/**
 * Analyzes asset performance data to detect anomalies
 */
export function analyzeAssetPerformance(
  performanceHistory: { [date: string]: number }
): PerformanceAnalysis {
  const dates = Object.keys(performanceHistory)
    .sort()
    .filter(date => performanceHistory[date] !== null && !isNaN(performanceHistory[date]));

  if (dates.length < 2) {
    return {
      changePercentage: 0,
      trend: 'stable',
      anomalyDetected: false,
    };
  }

  // Get oldest and newest values
  const oldestValue = performanceHistory[dates[0]];
  const newestValue = performanceHistory[dates[dates.length - 1]];

  // Calculate change percentage
  const changePercentage = ((newestValue - oldestValue) / oldestValue) * 100;

  // Calculate average and standard deviation
  const values = dates.map(date => performanceHistory[date]);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Detect anomalies (values outside 2 standard deviations)
  const anomalyDetected = values.some(val => Math.abs(val - average) > 2 * stdDev);

  // Determine trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (changePercentage < -3) {
    trend = 'declining';
  } else if (changePercentage > 3) {
    trend = 'improving';
  }

  return {
    changePercentage,
    trend,
    anomalyDetected,
  };
}

/**
 * Generates AI insights based on performance analysis
 */
export function generateInsights(
  assetId: string | null,
  currentPR: number | null,
  performanceHistory: { [date: string]: number },
  currentDate: string
): Insight[] {
  const insights: Insight[] = [];

  if (!assetId || currentPR === null) {
    return insights;
  }

  const analysis = analyzeAssetPerformance(performanceHistory);

  // Insight 1: Critical Performance Drop
  if (analysis.trend === 'declining' && Math.abs(analysis.changePercentage) > 10) {
    insights.push({
      id: `insight-drop-${assetId}`,
      severity: 'critical',
      title: '⚠️ Critical Performance Drop Detected',
      description: `Asset ${assetId} has experienced a significant ${Math.abs(analysis.changePercentage).toFixed(1)}% drop in performance ratio over the observed period. This represents a severe deviation from baseline performance.`,
      recommendation: `Immediate investigation recommended. Check for: (1) Inverter faults or offline status, (2) DC string disconnections, (3) Accumulated soiling on panels, (4) Shading or obstructions. Schedule preventive maintenance within 24-48 hours.`,
      affectedAsset: assetId,
      timestamp: new Date(),
    });
  }

  // Insight 2: Moderate Performance Decline
  if (analysis.trend === 'declining' && Math.abs(analysis.changePercentage) > 5 && Math.abs(analysis.changePercentage) <= 10) {
    insights.push({
      id: `insight-decline-${assetId}`,
      severity: 'warning',
      title: '⚠️ Performance Decline Detected',
      description: `Asset ${assetId} shows a ${Math.abs(analysis.changePercentage).toFixed(1)}% decline in performance. While not critical, this trend warrants monitoring.`,
      recommendation: `Monitor this asset closely over the next 7 days. If decline continues, initiate maintenance checks. Consider cleaning panels and checking for partial shading.`,
      affectedAsset: assetId,
      timestamp: new Date(),
    });
  }

  // Insight 3: Anomaly Detection
  if (analysis.anomalyDetected && !insights.some(i => i.severity === 'critical')) {
    insights.push({
      id: `insight-anomaly-${assetId}`,
      severity: 'warning',
      title: '🔍 Unusual Performance Pattern',
      description: `Asset ${assetId} exhibits unusual performance fluctuations. Performance values show significant variance, suggesting intermittent issues or environmental factors.`,
      recommendation: `Review environmental conditions (weather, cloud cover, temperature). Check for intermittent connection issues or equipment cycling. Correlate with meteorological data.`,
      affectedAsset: assetId,
      timestamp: new Date(),
    });
  }

  // Insight 4: Excellent Performance
  if (analysis.trend === 'improving' && analysis.changePercentage > 5) {
    insights.push({
      id: `insight-improvement-${assetId}`,
      severity: 'info',
      title: '✅ Performance Improvement Trend',
      description: `Asset ${assetId} is showing positive performance improvement with a ${analysis.changePercentage.toFixed(1)}% increase. Excellent operational status detected.`,
      recommendation: `Continue current maintenance schedule. This asset is operating optimally. Consider it as a baseline reference for similar units.`,
      affectedAsset: assetId,
      timestamp: new Date(),
    });
  }

  // Insight 5: Low PR Value
  if (currentPR < 0.007) {
    insights.push({
      id: `insight-low-pr-${assetId}`,
      severity: 'warning',
      title: '📉 Low Performance Ratio Value',
      description: `Asset ${assetId} currently operates at ${(currentPR * 100).toFixed(2)}% performance ratio, which is below optimal thresholds (target: 0.9-1.0).`,
      recommendation: `Verify system is generating power during optimal sun hours. Check for AC/DC wiring issues, inverter efficiency losses, or measurement errors. Validate sensor calibration.`,
      affectedAsset: assetId,
      timestamp: new Date(),
    });
  }

  // Default insight if no data-driven insights generated
  if (insights.length === 0) {
    insights.push({
      id: `insight-normal-${assetId}`,
      severity: 'info',
      title: '✓ Operating Normally',
      description: `Asset ${assetId} is operating within normal parameters with stable performance characteristics.`,
      recommendation: `Continue routine monitoring. Schedule quarterly maintenance as per operational guidelines.`,
      affectedAsset: assetId,
      timestamp: new Date(),
    });
  }

  return insights;
}

/**
 * Get severity color for UI rendering
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#ff4444';
    case 'warning':
      return '#ff9800';
    case 'info':
      return '#2196f3';
    default:
      return '#666';
  }
}

/**
 * Get severity background color for UI rendering
 */
export function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return '#ffebee';
    case 'warning':
      return '#fff3e0';
    case 'info':
      return '#e3f2fd';
    default:
      return '#f5f5f5';
  }
}
