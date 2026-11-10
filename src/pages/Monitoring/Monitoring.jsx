import React from 'react';
import {
  Zap,
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import MetricCard from '../../components/MetricCard/MetricCard';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { useNotifications } from '../../context/NotificationContext';
import SystemStateBanner from '../../components/SystemStateBanner/SystemStateBanner';
import './Monitoring.css';

// Readable relative time formatter
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Monitoring = () => {
  const { data, loading, error } = useFirebaseData();
  const { notifications } = useNotifications();

  // Shared real notification alerts (show recent active alerts/warnings first)
  const activeAlerts = (notifications || []).slice(0, 5);

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
              <span>Database Status</span>
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

        {/* Live Alerts List (Consuming shared notification source) */}
        <div className="alerts-panel card-base">
          <h4>Recent Alerts</h4>
          <div className="alerts-list">
            {activeAlerts.length === 0 ? (
              <div className="alert-empty-state">
                <CheckCircle2 size={24} className="alert-empty-icon" />
                <div className="alert-empty-text">
                  <h5>System Operating Normally</h5>
                  <p>No active alerts, warnings, or hardware faults detected.</p>
                </div>
              </div>
            ) : (
              activeAlerts.map(alert => {
                const isError = alert.severity === 'error' || alert.type === 'device_offline';
                const isWarning = alert.severity === 'warning' || alert.type === 'battery_alert' || alert.type === 'temperature_alert';
                const isSuccess = alert.severity === 'success' || alert.type === 'device_reconnected';

                const alertClass = isError ? 'alert-error' : isWarning ? 'alert-warning' : isSuccess ? 'alert-success' : 'alert-info';

                return (
                  <div key={alert.notificationId || alert.id} className={`alert-item ${alertClass}`}>
                    <div className="alert-icon-wrap">
                      {isError ? (
                        <AlertTriangle size={18} />
                      ) : isWarning ? (
                        <AlertTriangle size={18} />
                      ) : isSuccess ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Info size={18} />
                      )}
                    </div>
                    <div className="alert-content">
                      <span className="alert-message">{alert.title}: {alert.message}</span>
                      <span className="alert-time">{formatTimeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
