import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ label, percentage, color }) => {
  const safePercentage = Math.min(100, Math.max(0, percentage ?? 0));
  
  return (
    <div className="progress-container">
      <div className="progress-header">
        {label && <span className="progress-label">{label}</span>}
        <span className="progress-value">{Math.round(safePercentage)}%</span>
      </div>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${safePercentage}%`,
            backgroundColor: color || 'var(--color-solar-blue)' 
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
