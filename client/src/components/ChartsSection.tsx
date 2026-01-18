import React from 'react';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { PerformanceDistributionChart } from './PerformanceDistributionChart';

interface ChartsSectionProps {
  selectedAsset: string | null;
  assetPerformanceHistory: { [date: string]: number };
  dates: string[];
  currentDate: string;
  performanceData: { [assetId: string]: number };
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  selectedAsset,
  assetPerformanceHistory,
  dates,
  currentDate,
  performanceData,
}) => {
  return (
    <div className="charts-section">
      <div className="chart-card">
        <PerformanceTrendChart
          assetId={selectedAsset}
          performanceHistory={assetPerformanceHistory}
          dates={dates}
        />
      </div>

      <div className="chart-card">
        <PerformanceDistributionChart
          currentDate={currentDate}
          performanceData={performanceData}
        />
      </div>
    </div>
  );
};
