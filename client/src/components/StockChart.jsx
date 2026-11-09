import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

const StockChart = ({ historyData = [], symbol = '' }) => {
  if (!historyData || historyData.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p>No historical price data available</p>
      </div>
    );
  }

  const prices = historyData.map(h => h.price);
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const isGain = lastPrice >= firstPrice;
  const lineColor = isGain ? '#10b981' : '#ef4444';
  const fillColor = isGain ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)';

  const data = {
    labels: historyData.map(h =>
      new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: symbol ? `${symbol} Price ($)` : 'Price ($)',
        data: prices,
        fill: true,
        backgroundColor: fillColor,
        borderColor: lineColor,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(13, 31, 60, 0.95)',
        borderColor: 'rgba(99, 179, 237, 0.2)',
        borderWidth: 1,
        titleColor: '#94a3b8',
        bodyColor: '#f0f6ff',
        padding: 12,
        callbacks: {
          label: ctx => ` $${ctx.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(99, 179, 237, 0.05)' },
        border: { display: false },
        ticks: {
          color: '#4b6280',
          font: { size: 11 },
          callback: val => `$${val.toFixed(0)}`
        }
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#4b6280',
          font: { size: 11 },
          maxTicksLimit: 8
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};

export default StockChart;
