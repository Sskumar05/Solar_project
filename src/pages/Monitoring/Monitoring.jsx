import React from 'react';
import { Zap, Thermometer, Droplets, Activity, AlertTriangle, WifiOff } from 'lucide-react';
import MetricCard from '../../components/MetricCard/MetricCard';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import SystemStateBanner from '../../components/SystemStateBanner/SystemStateBanner';
import './Monitoring.css';

const mockAlerts = [
  { id: 1, type: 'warning', icon: Thermometer, message: 'High temperature detected in inverter compartment', time: '2 mins ago' },
  { id: 2, type: 'error', icon: AlertTriangle, message: 'Battery voltage below critical threshold (11.8V)', time: '1 hour ago' },
  { id: 3, type: 'neutral', icon: WifiOff, message: 'Device temporarily offline', time: 'Yesterday, 14:30' }
];

const Monitoring = () => {
  const { data, loading, error } = useFirebaseData();

  return (
    <div className="monitoring-page">
      <SystemStateBanner loading={loading} error={error} data={data} />
      
      <SectionHeader title="System Monitoring" subtitle="Raw sensor data and device status" />

      <div className="monitoring-sensor-grid">
        <MetricCard icon={Activity} label="Solar Voltage" value={data?.sensors?.voltage ?? '--'} unit="V" trend="+1.2%" trendDirection="up" />
        <MetricCard icon={Zap} label="Solar Current" value={data?.sensors?.current ?? '--'} unit="A" trend="-0.5%" trendDirection="down" />
        <MetricCard icon={Thermometer} label="Temperature" value={data?.sensors?.temperature ?? '--'} unit="°C" trend="+0.1%" trendDirection="neutral" />
        <MetricCard icon={Droplets} label="Humidity" value={data?.sensors?.humidity ?? '--'} unit="%" trend="-2.0%" trendDirection="down" />
      </div>

      <div className="monitoring-bottom-row">
        {/* System Status Panel */}
        <div className="status-panel card-base">
          <h4>System Diagnostics</h4>
          <div className="status-list">
            <div className="status-item">
              <span>Device Status</span>
              <StatusBadge text={data?.system?.status ?? '--'} variant={data?.system?.status?.toLowerCase() === 'online' ? 'success' : 'neutral'} />
            </div>
            <div className="status-item">
              <span>Firebase Database</span>
              <StatusBadge text={error ? 'Disconnected' : (loading ? '--' : 'Connected')} variant={error ? 'error' : 'success'} />
            </div>
            <div className="status-item">
              <span>Wi-Fi Signal</span>
              <StatusBadge text={data?.system?.status?.toLowerCase() === 'online' ? 'Strong' : '--'} variant={data?.system?.status?.toLowerCase() === 'online' ? 'success' : 'neutral'} />
            </div>
            <div className="status-item">
              <span>Sensor Health</span>
              <StatusBadge text="Normal" variant="success" />
            </div>
            <div className="status-item">
              <span>Last Update</span>
              <span className="last-update-text">{data?.system?.lastUpdate ?? '--'}</span>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="alerts-panel card-base">
          <h4>Recent Alerts</h4>
          <div className="alerts-list">
            {mockAlerts.map(alert => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                  <div className="alert-icon-wrap">
                    <Icon size={18} />
                  </div>
                  <div className="alert-content">
                    <span className="alert-message">{alert.message}</span>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
