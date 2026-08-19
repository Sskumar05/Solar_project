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
  Filler,
  Legend,
} from 'chart.js';
import { Zap, Thermometer, Droplets, Activity } from 'lucide-react';

import MetricCard from '../../components/MetricCard/MetricCard';
import ChartCard from '../../components/ChartCard/ChartCard';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';

import { useFirebaseData } from '../../hooks/useFirebaseData';
import { getSourceDescription } from '../../services/firebaseService';
import SystemStateBanner from '../../components/SystemStateBanner/SystemStateBanner';
import './Overview.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Overview = () => {
  const { data, loading, error } = useFirebaseData();
  const [chartRange, setChartRange] = useState('Today');

  // Computed values — derived from live data so they update automatically
  const voltage = data?.sensors?.voltage;
  const current = data?.sensors?.current;
  const solarPower = data?.energy?.solarPower;
  const batteryLevel = data?.energy?.batteryLevel;
  const activeSource = data?.energy?.activeSource;

  // Efficiency: P = V × I → efficiency = solarPower / (V × I) × 100
  const theoreticalPower = voltage != null && current != null ? voltage * current : null;
  const efficiency = theoreticalPower != null && theoreticalPower > 0 && solarPower != null
    ? Math.min(100, Math.round((solarPower / theoreticalPower) * 100))
    : null;

  // Contribution bars — derived from activeSource + batteryLevel
  const isSolar = activeSource?.toLowerCase() === 'solar';
  const isBattery = activeSource?.toLowerCase() === 'battery';
  const solarContrib = isSolar ? Math.max(0, 100 - (batteryLevel ?? 0) * 0.1) : 0;
  const batteryContrib = isBattery ? 100 : (batteryLevel != null ? Math.round(batteryLevel * 0.25) : 0);
  const gridContrib = Math.max(0, 100 - solarContrib - batteryContrib);

  const chartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Solar Generation (kWh)',
        data: [0, 0, 4.5, 12, 8.5, 1, 0],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Energy Consumption (kWh)',
        data: [2, 1.5, 3, 5, 4, 6, 3],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="overview-page">
      <SystemStateBanner loading={loading} error={error} data={data} />
      
      <SectionHeader title="Dashboard Overview" subtitle="System status and energy production" />
      
      <div className="overview-top-row">
        {/* 1. Hero Card */}
        <div className="hero-card">
          <div className="hero-header">
            <h3>Solar Energy System</h3>
            <div className="hero-badge-wrap">
              <span className="hero-dot"></span> System Active
            </div>
          </div>
          <div className="hero-main-value">
            <span className="hero-value">{data?.energy?.solarPower ?? '--'}</span>
            <span className="hero-unit">W</span>
          </div>
          <div className="hero-sub-stats">
            <div className="hero-stat"><span>V:</span> {voltage ?? '--'}V</div>
            <div className="hero-stat"><span>I:</span> {current ?? '--'}A</div>
            <div className="hero-stat"><span>Eff:</span> {efficiency != null ? `${efficiency}%` : '--'}</div>
          </div>
          <div className="css-solar-panel">
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
          </div>
        </div>

        {/* 2. Energy Production Card */}
        <ChartCard 
          title="Today's Solar Generation" 
          subtitle={`${data?.energy?.solarPower ?? '--'} kWh · Updated ${data?.system?.lastUpdate ?? '--'}`}
          rangeOptions={['Today', '7 Days', '30 Days']}
          activeRange={chartRange}
          onRangeChange={setChartRange}
        >
          <Line data={chartData} options={chartOptions} />
        </ChartCard>
      </div>

      <div className="overview-mid-row">
        {/* 3. Sensor Overview Row */}
        <div className="sensor-grid">
          <MetricCard icon={Activity} label="Solar Voltage" value={data?.sensors?.voltage ?? '--'} unit="V" trend="+1.2%" trendDirection="up" />
          <MetricCard icon={Zap} label="Solar Current" value={data?.sensors?.current ?? '--'} unit="A" trend="-0.5%" trendDirection="down" />
          <MetricCard icon={Thermometer} label="Temperature" value={data?.sensors?.temperature ?? '--'} unit="°C" trend="+0.1%" trendDirection="neutral" />
          <MetricCard icon={Droplets} label="Humidity" value={data?.sensors?.humidity ?? '--'} unit="%" trend="-2.0%" trendDirection="down" />
        </div>

        {/* 4. Energy Source Card */}
        <div className="card-base energy-source-card">
          <h4>Active Source</h4>
          <div className="source-display">
            <Zap size={32} className="source-icon" />
            <span className="source-name">{data?.energy?.activeSource ?? '--'}</span>
          </div>
          <p className="source-desc">{getSourceDescription(activeSource)}</p>
          <div className="relay-status">
            <span>Relay Status:</span>
            <StatusBadge text={data?.system?.relayStatus ?? '--'} variant="neutral" />
          </div>
        </div>

        {/* 5. Battery Status Card */}
        <div className="card-base battery-status-card">
          <div className="battery-header">
            <h4>Battery Status</h4>
            <StatusBadge text={data?.energy?.batteryLevel !== undefined ? "Charging" : "--"} variant="success" />
          </div>
          <div className="battery-main">
            <span className="battery-value">{data?.energy?.batteryLevel ?? '--'}%</span>
          </div>
          <ProgressBar percentage={data?.energy?.batteryLevel ?? 0} color="var(--color-energy-green)" />
          <div className="battery-footer">
            <span>{data?.sensors?.voltage ?? '--'}V</span>
            <span>Solar Charge</span>
          </div>
        </div>
      </div>

      {/* 6. Energy Consumption Card */}
      <div className="card-base energy-consumption-card">
        <h4>Energy Consumption Sources
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--gray-500)', marginLeft: '0.5rem' }}>
            (estimated from active source)
          </span>
        </h4>
        <div className="consumption-bars">
          <ProgressBar label="Solar Contribution" percentage={solarContrib} color="var(--color-solar-blue)" />
          <ProgressBar label="Battery Contribution" percentage={batteryContrib} color="var(--color-energy-green)" />
          <ProgressBar label="Grid Contribution" percentage={gridContrib} color="var(--gray-400)" />
        </div>
      </div>
    </div>
  );
};

export default Overview;
