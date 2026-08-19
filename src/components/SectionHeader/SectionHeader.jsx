import React from 'react';
import './SectionHeader.css';

const SectionHeader = ({ title, subtitle, action }) => {
  return (
    <div className="section-header-container">
      <div className="section-title-group">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  );
};

export default SectionHeader;
