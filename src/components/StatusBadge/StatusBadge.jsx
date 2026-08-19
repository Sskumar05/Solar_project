import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ text, variant = 'neutral' }) => {
  return (
    <div className={`status-badge badge-${variant}`}>
      <span className="status-badge-dot"></span>
      <span className="status-badge-text">{text}</span>
    </div>
  );
};

export default StatusBadge;
