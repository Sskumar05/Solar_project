import React from 'react';
import './ChartCard.css';

const ChartCard = ({ title, subtitle, children, rangeOptions = [], activeRange, onRangeChange }) => {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title-group">
          <h3 className="chart-card-title">{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {rangeOptions.length > 0 && (
          <div className="chart-range-toggles">
            {rangeOptions.map(option => (
              <button
                key={option}
                className={`range-toggle ${activeRange === option ? 'active' : ''}`}
                onClick={() => onRangeChange && onRangeChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="chart-card-body">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
