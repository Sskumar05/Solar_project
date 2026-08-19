import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import './MetricCard.css';

const MetricCard = ({ icon: Icon, label, value, unit, trend, trendDirection = 'neutral' }) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        {Icon && <div className="metric-icon"><Icon size={18} /></div>}
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-body">
        <div className="metric-value-group">
          <span className="metric-value">{value}</span>
          {unit && <span className="metric-unit">{unit}</span>}
        </div>
        {trend && (
          <div className={`metric-trend trend-${trendDirection}`}>
            {trendDirection === 'up' && <ArrowUpRight size={14} />}
            {trendDirection === 'down' && <ArrowDownRight size={14} />}
            {trendDirection === 'neutral' && <Minus size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
