import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceTrendChartProps {
  assetId: string | null;
  performanceHistory: { [date: string]: number };
  dates: string[];
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  assetId,
  performanceHistory,
  dates,
}) => {
  const chartData = useMemo(() => {
    if (!assetId || !performanceHistory || dates.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const sortedDates = [...dates].sort();
    const values = sortedDates.map(date => performanceHistory[date] || null);

    return {
      labels: sortedDates.map(date => date.split('-').slice(1).join('-')), // Format as MM-DD
      datasets: [
        {
          label: `Performance Ratio - ${assetId}`,
          data: values,
          borderColor: '#0052cc',
          backgroundColor: 'rgba(0, 82, 204, 0.1)',
          borderWidth: 2,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#0052cc',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          tension: 0.4,
        },
      ],
    };
  }, [assetId, performanceHistory, dates]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#1a1a1a',
          font: {
            size: 12,
            weight: 'bold',
          },
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: `Asset Performance Trend - ${assetId || 'None Selected'}`,
        color: '#0052cc',
        font: {
          size: 14,
          weight: 'bold',
        },
        padding: 15,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#0052cc',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            return `PR: ${(context.parsed.y?.toFixed(4) || 'N/A')}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#666',
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Date',
          color: '#1a1a1a',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      y: {
        ticks: {
          color: '#666',
          font: {
            size: 11,
          },
          callback: function (value) {
            return (value as number).toFixed(4);
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Performance Ratio (PR)',
          color: '#1a1a1a',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
  };

  if (!assetId) {
    return (
      <div className="chart-placeholder">
        <p>Select an asset from the map to view its performance trend</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
};
