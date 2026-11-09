import React from 'react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

const PortfolioChart = ({ holdings = [] }) => {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p>No holdings to display</p>
      </div>
    );
  }

  const data = {
    labels: holdings.map(h => h.symbol),
    datasets: [{
      data: holdings.map(h => h.currentValue?.toFixed(2)),
      backgroundColor: holdings.map((_, i) => COLORS[i % COLORS.length]),
      borderColor: holdings.map((_, i) => COLORS[i % COLORS.length]),
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 8
    }]
  };

  const options = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { size: 12, family: 'Inter' },
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(13,31,60,0.95)',
        borderColor: 'rgba(99,179,237,0.2)',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#f0f6ff',
        padding: 12,
        callbacks: {
          label: ctx => ` $${parseFloat(ctx.parsed).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${((ctx.parsed / ctx.dataset.data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)) * 100).toFixed(1)}%)`
        }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
};

export default PortfolioChart;
