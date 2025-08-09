import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { RecommendedMajor } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ResultChartProps {
  majors: RecommendedMajor[];
  type?: 'bar' | 'doughnut';
  onTypeChange?: (type: 'bar' | 'doughnut') => void;
}

const ResultChart: React.FC<ResultChartProps> = ({ majors, type = 'bar', onTypeChange }) => {
  const labels = majors.map(m => (m as any).majorName || (m as any).major?.name || 'Unknown');
  const scores = majors.map(m => m.matchScore);

  const colors = [
    'rgba(59, 130, 246, 0.8)',  // Blue
    'rgba(16, 185, 129, 0.8)',  // Green
    'rgba(245, 101, 101, 0.8)', // Red
    'rgba(251, 191, 36, 0.8)',  // Yellow
    'rgba(139, 92, 246, 0.8)',  // Purple
    'rgba(236, 72, 153, 0.8)',  // Pink
  ];

  const borderColors = [
    'rgba(59, 130, 246, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 101, 101, 1)',
    'rgba(251, 191, 36, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(236, 72, 153, 1)',
  ];

  const barData = {
    labels,
    datasets: [
      {
        label: 'Độ phù hợp (%)',
        data: scores,
        backgroundColor: colors.slice(0, majors.length),
        borderColor: borderColors.slice(0, majors.length),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const doughnutData = {
    labels,
    datasets: [
      {
        data: scores,
        backgroundColor: colors.slice(0, majors.length),
        borderColor: borderColors.slice(0, majors.length),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Độ phù hợp các ngành học',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Phân bố độ phù hợp',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}% (${percentage}% của tổng)`;
          },
        },
      },
    },
  };

  if (majors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Không có dữ liệu để hiển thị biểu đồ</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {type === 'bar' ? (
        <div className="h-64 md:h-80">
          <Bar data={barData} options={barOptions} />
        </div>
      ) : (
        <div className="h-64 md:h-80">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      )}
      
      {/* Chart Type Toggle */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => onTypeChange?.('bar')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            type === 'bar' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Biểu đồ cột
        </button>
        <button
          onClick={() => onTypeChange?.('doughnut')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            type === 'doughnut' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Biểu đồ tròn
        </button>
      </div>

      {/* Legend for mobile */}
      <div className="mt-4 md:hidden">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Chú thích:</h4>
        <div className="grid grid-cols-1 gap-2">
          {majors.map((major, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: colors[index] }}
              ></div>
              <span className="text-sm text-gray-700">
                {(major as any).majorName || (major as any).major?.name} ({major.matchScore}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultChart;
