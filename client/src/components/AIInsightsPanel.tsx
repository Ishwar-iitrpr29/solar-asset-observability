import React, { useMemo } from 'react';
import { generateInsights, Insight, getSeverityColor, getSeverityBgColor } from '../services/insightService';

interface AIInsightsPanelProps {
  assetId: string | null;
  currentPR: number | null;
  performanceHistory?: { [date: string]: number };
  currentDate: string;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
}

/**
 * AI Insights Panel Component
 * Displays AI-generated insights about solar asset performance
 * Shows anomalies, performance drops, recommendations, and operational status
 */
export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  assetId,
  currentPR,
  performanceHistory = {},
  currentDate,
  isExpanded = true,
  onToggleExpand,
}) => {
  // Generate insights based on current data
  const insights: Insight[] = useMemo(() => {
    return generateInsights(assetId, currentPR, performanceHistory, currentDate);
  }, [assetId, currentPR, performanceHistory, currentDate]);

  const handleToggle = () => {
    onToggleExpand?.(!isExpanded);
  };

  // Determine panel state
  const hasCriticalInsight = insights.some(i => i.severity === 'critical');
  const hasWarningInsight = insights.some(i => i.severity === 'warning');

  return (
    <div className={`ai-insights-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Panel Header */}
      <div className="insights-header" onClick={handleToggle}>
        <div className="insights-header-left">
          <div className="insights-icon">
            {hasCriticalInsight ? (
              <span className="icon-critical">⚠️</span>
            ) : hasWarningInsight ? (
              <span className="icon-warning">⚙️</span>
            ) : (
              <span className="icon-info">🤖</span>
            )}
          </div>
          <div className="insights-header-text">
            <h3 className="insights-title">AI Insights Agent</h3>
            {assetId && (
              <p className="insights-subtitle">Analysis for {assetId}</p>
            )}
            {!assetId && (
              <p className="insights-subtitle">Select an asset to view insights</p>
            )}
          </div>
        </div>
        <div className="insights-toggle">
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </div>
      </div>

      {/* Panel Content */}
      {isExpanded && (
        <div className="insights-content">
          {!assetId ? (
            <div className="insights-empty-state">
              <p>👉 Click on a solar asset on the map to receive AI-powered insights</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="insights-loading">
              <p>Generating insights...</p>
            </div>
          ) : (
            <div className="insights-list">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Individual Insight Card Component
 */
interface InsightCardProps {
  insight: Insight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div
      className={`insight-card insight-${insight.severity}`}
      style={{ backgroundColor: getSeverityBgColor(insight.severity) }}
    >
      <div className="insight-card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="insight-severity-badge" style={{ borderLeftColor: getSeverityColor(insight.severity) }}>
          <span className="insight-title">{insight.title}</span>
        </div>
        <span className={`insight-expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>

      {isExpanded && (
        <div className="insight-card-content">
          <div className="insight-description">
            <p>{insight.description}</p>
          </div>

          <div className="insight-recommendation">
            <h5 className="recommendation-title">🔧 Recommendation:</h5>
            <p>{insight.recommendation}</p>
          </div>

          <div className="insight-metadata">
            <span className="insight-time">
              {insight.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;
