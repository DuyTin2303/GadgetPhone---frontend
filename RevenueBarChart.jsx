// Chart.js wrapper cho React
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function RevenueBarChart({ data, labels }) {
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: data,
        backgroundColor: '#1976d2',
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'Tháng' } },
      y: { title: { display: true, text: 'Doanh thu (VNĐ)' }, beginAtZero: true },
    },
  };
  return <Bar data={chartData} options={options} />;
}

export default RevenueBarChart;
