import React from 'react';
import { formatDate, PRtoPercentage } from '../utils/colorScale';

interface AssetStats {
  lowest: number;
  lowestDate: string;
  highest: number;
  highestDate: string;
  average: number;
}

interface AssetInfoPanelProps {
  assetId: string | null;
  pr: number | null;
  date: string;
  performanceHistory?: { [date: string]: number };
}

const calculateStats = (performanceHistory: { [date: string]: number }): AssetStats | null => {
  const values = Object.entries(performanceHistory)
    .filter(([_, value]) => value !== null && !isNaN(value))
    .map(([date, value]) => ({ date, value }));

  if (values.length === 0) return null;

  let lowest = values[0];
  let highest = values[0];
  let sum = 0;

  values.forEach(({ date, value }) => {
    sum += value;
    if (value < lowest.value) lowest = { date, value };
    if (value > highest.value) highest = { date, value };
  });

  return {
    lowest: lowest.value,
    lowestDate: lowest.date,
    highest: highest.value,
    highestDate: highest.date,
    average: sum / values.length,
  };
};

export const AssetInfoPanel: React.FC<AssetInfoPanelProps> = ({ 
  assetId, 
  pr, 
  date,
  performanceHistory = {}
}) => {
  const stats = assetId && Object.keys(performanceHistory).length > 0 
    ? calculateStats(performanceHistory)
    : null;

  return (
    <div className="asset-info-panel">
      {assetId ? (
        <div className="asset-info-content">
          <div className="asset-info-row">
            <span className="asset-info-label">Asset ID:</span>
            <span className="asset-info-value">{assetId}</span>
          </div>
          <div className="asset-info-row">
            <span className="asset-info-label">Current Date:</span>
            <span className="asset-info-value">{formatDate(date)}</span>
          </div>
          {pr !== null ? (
            <>
              <div className="asset-info-row">
                <span className="asset-info-label">Current PR:</span>
                <span className="asset-info-value">{PRtoPercentage(pr)}%</span>
              </div>
              <div className="performance-bar-container">
                <div className="performance-bar-background">
                  <div 
                    className={`performance-bar-fill ${
                      pr < 0.005 ? 'low' : pr < 0.009 ? 'medium' : 'high'
                    }`}
                    style={{ width: `${Math.min(PRtoPercentage(pr), 100)}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="asset-info-no-data">No data available for this date</p>
          )}

          {stats && (
            <>
              <hr className="asset-info-divider" />
              <h4 className="asset-info-stats-title">Performance Statistics</h4>
              
              <div className="asset-info-stat-row">
                <div className="asset-info-stat">
                  <span className="stat-label">Highest PR</span>
                  <span className="stat-value high">{PRtoPercentage(stats.highest)}%</span>
                  <span className="stat-date">{formatDate(stats.highestDate)}</span>
                </div>
                <div className="asset-info-stat">
                  <span className="stat-label">Average PR</span>
                  <span className="stat-value avg">{PRtoPercentage(stats.average)}%</span>
                </div>
                <div className="asset-info-stat">
                  <span className="stat-label">Lowest PR</span>
                  <span className="stat-value low">{PRtoPercentage(stats.lowest)}%</span>
                  <span className="stat-date">{formatDate(stats.lowestDate)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="asset-info-placeholder">Hover over or click an asset to view details</p>
      )}
    </div>
  );
};
