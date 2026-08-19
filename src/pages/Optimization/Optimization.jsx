import React from 'react';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import SystemStateBanner from '../../components/SystemStateBanner/SystemStateBanner';
import { ArrowRight } from 'lucide-react';
import './Optimization.css';

const Optimization = () => {
  const { data, loading, error } = useFirebaseData();
  const optStatus = "Solar Preferred"; // In a real app this might come from Firebase or local state
  const decisionText = "Solar power is sufficient. Load is currently running from solar energy.";
  const lastSwitch = "Battery → Solar, 10:42 AM";

  const historyEvents = data?.history || [];

  return (
    <div className="optimization-page">
      <SystemStateBanner loading={loading} error={error} data={data} />

      <SectionHeader title="Energy Optimization" subtitle="Intelligent load balancing and source switching" />
      
      <div className="optimization-top-row">
        {/* Status Card */}
        <div className="opt-status-card card-base">
          <div className="opt-status-header">
            <h4>Optimization Status</h4>
            <StatusBadge text={optStatus} variant="success" />
          </div>
          <div className="opt-decision-block">
            <span className="decision-label">Current Decision</span>
            <p className="decision-text">{decisionText}</p>
          </div>
          
          <div className="opt-metrics">
            <div className="relay-indicator">
              <span className="relay-label">Relay Status</span>
              <StatusBadge text={data?.system?.relayStatus ?? '--'} variant={data?.system?.relayStatus === 'ON' ? 'success' : 'neutral'} />
            </div>
            <div className="last-switch">
              <span className="switch-label">Last Switching Event</span>
              <span className="switch-value">{lastSwitch}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="optimization-history-row" style={{ marginTop: '1.5rem' }}>
        <div className="history-card card-base">
          <h4>Energy Source History</h4>
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Transition</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyEvents.length > 0 ? historyEvents.map((event, i) => (
                  <tr key={event.id || i}>
                    <td>{event.time ?? '--'}</td>
                    <td>
                      <div className="transition-cell">
                        <span className="source-tag">{event.prev ?? '--'}</span>
                        <ArrowRight size={14} className="arrow-icon" />
                        <span className="source-tag">{event.next ?? '--'}</span>
                      </div>
                    </td>
                    <td>{event.reason ?? '--'}</td>
                    <td>
                      <StatusBadge 
                        text={event.status ?? '--'} 
                        variant={event.status === 'Success' ? 'success' : (event.status === 'Warning' ? 'warning' : 'neutral')} 
                      />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                      No history events available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Optimization;
