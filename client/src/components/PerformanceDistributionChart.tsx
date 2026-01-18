import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceDistributionChartProps {
  currentDate: string;
  performanceData: { [assetId: string]: number };
}

export const PerformanceDistributionChart: React.FC<PerformanceDistributionChartProps> = ({
  currentDate,
  performanceData,
}) => {
  const chartData = useMemo(() => {
    if (!performanceData || Object.keys(performanceData).length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Create performance bins (0.001 intervals)
    const bins: { [key: string]: number } = {};
    const binSize = 0.0001;

    Object.values(performanceData).forEach(value => {
      if (!isNaN(value)) {
        const binKey = (Math.floor(value / binSize) * binSize).toFixed(4);
        bins[binKey] = (bins[binKey] || 0) + 1;
      }
    });

    const sortedBins = Object.keys(bins).sort((a, b) => parseFloat(a) - parseFloat(b));

    return {
      labels: sortedBins.map(bin => bin),
      datasets: [
        {
          label: 'Asset Count',
          data: sortedBins.map(bin => bins[bin]),
          backgroundColor: 'rgba(0, 82, 204, 0.7)',
          borderColor: '#0052cc',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [performanceData]);

  const options: ChartOptions<'bar'> = {
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
        text: `Performance Ratio Distribution - ${currentDate}`,
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
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            return `Assets: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#666',
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 45,
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
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666',
          font: {
            size: 11,
          },
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Number of Assets',
          color: '#1a1a1a',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};
