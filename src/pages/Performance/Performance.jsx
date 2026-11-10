import React, { useState } from 'react';
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
  Filler
} from 'chart.js';

import ChartCard from '../../components/ChartCard/ChartCard';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import SystemStateBanner from '../../components/SystemStateBanner/SystemStateBanner';
import './Performance.css';

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

// Static time-series mock data per range (charts need dense data; history node stores switching events)
const MOCK_ENERGY_DATA = {
  'Today': {
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    solar:   [0,    0,    0,    0.5,  4.5,  9.0,  12.0, 11.0, 8.5,  3.0,  1.0,  0],
    load:    [2.0,  1.5,  1.5,  2.0,  3.0,  4.5,  5.0,  5.5,  4.0,  6.0,  4.5,  3.0],
    battery: [0,    0,    0,    0.5,  1.5,  -4.5, -7.0, -5.5, -4.5, 3.0,  3.5,  3.0],
  },
  'This Week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    solar:   [45,   52,   38,   60,   55,   42,   50],
    load:    [40,   42,   45,   39,   41,   50,   48],
    battery: [5,    -10,  7,    -21,  -14,  8,    -2],
  },
  'This Month': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    solar:   [300, 320, 290, 340],
    load:    [280, 290, 300, 310],
    battery: [20,  -30, 10,  -30],
  },
};

const MOCK_ENV_DATA = {
  'Today': {
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    temperature: [22, 21, 21, 22, 25, 28, 32, 33, 30, 27, 25, 23],
    humidity:    [65, 68, 70, 68, 55, 47, 40, 38, 45, 52, 57, 62],
  },
  'This Week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    temperature: [28, 30, 27, 33, 31, 29, 26],
    humidity:    [60, 55, 65, 40, 45, 58, 70],
  },
  'This Month': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    temperature: [28, 31, 29, 27],
    humidity:    [60, 48, 55, 65],
  },
};

const Performance = () => {
  const { data, loading, error } = useFirebaseData();
  const [energyRange, setEnergyRange] = useState('Today');

  const currentEnergy = MOCK_ENERGY_DATA[energyRange];
  const currentEnv = MOCK_ENV_DATA[energyRange];

  // If live sensor data is available, append current reading as the latest data point
  const liveTemp = data?.sensors?.temperature;
  const liveHumidity = data?.sensors?.humidity;
  const envLabels = liveTemp != null
    ? [...currentEnv.labels, 'Now']
    : currentEnv.labels;
  const envTempData = liveTemp != null
    ? [...currentEnv.temperature, liveTemp]
    : currentEnv.temperature;
  const envHumidityData = liveHumidity != null
    ? [...currentEnv.humidity, liveHumidity]
    : currentEnv.humidity;

  const energyChartData = {
    labels: currentEnergy.labels,
    datasets: [
      {
        label: 'Solar Power (kWh)',
        data: currentEnergy.solar,
        borderColor: '#0d8253',
        backgroundColor: 'rgba(13, 130, 83, 0.12)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Load Consumption (kWh)',
        data: currentEnergy.load,
        borderColor: '#64748b',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: 'Battery Usage (kWh)',
        data: currentEnergy.battery,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        tension: 0.4,
      }
    ]
  };

  const energyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: false, grid: { color: 'rgba(241, 245, 249, 0.95)' } },
      x: { grid: { display: false } }
    }
  };

  const envChartData = {
    labels: envLabels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: envTempData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'transparent',
        yAxisID: 'y',
        tension: 0.4,
        pointRadius: (ctx) => ctx.dataIndex === envLabels.length - 1 && liveTemp != null ? 6 : 3,
        pointBackgroundColor: (ctx) => ctx.dataIndex === envLabels.length - 1 && liveTemp != null ? 'rgb(239,68,68)' : 'transparent',
      },
      {
        label: 'Humidity (%)',
        data: envHumidityData,
        borderColor: '#0d8253',
        backgroundColor: 'transparent',
        yAxisID: 'y1',
        tension: 0.4,
        pointRadius: (ctx) => ctx.dataIndex === envLabels.length - 1 && liveHumidity != null ? 6 : 3,
        pointBackgroundColor: (ctx) => ctx.dataIndex === envLabels.length - 1 && liveHumidity != null ? '#0d8253' : 'transparent',
      }
    ]
  };

  const envChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { grid: { display: false } },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: 'rgba(241, 245, 249, 0.95)' },
        title: { display: true, text: 'Temperature (°C)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Humidity (%)' }
      }
    }
  };

  return (
    <div className="performance-page">
      <SystemStateBanner loading={loading} error={error} data={data} />
      
      <SectionHeader title="System Performance" subtitle="Historical trends and environmental impact" />
      
      <div className="performance-charts-container">
        {/* 1. Energy Performance Chart */}
        <ChartCard 
          title="Energy Performance" 
          subtitle="Solar Generation vs. Consumption vs. Battery"
          rangeOptions={['Today', 'This Week', 'This Month']}
          activeRange={energyRange}
          onRangeChange={setEnergyRange}
        >
          <div className="chart-card-body tall-chart">
            <Line data={energyChartData} options={energyChartOptions} />
          </div>
        </ChartCard>

        {/* 2. Environmental Conditions Chart */}
        <ChartCard 
          title="Environmental Conditions" 
          subtitle="Temperature and Humidity impact on system"
        >
          <div className="chart-card-body tall-chart">
            <Line data={envChartData} options={envChartOptions} />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Performance;
