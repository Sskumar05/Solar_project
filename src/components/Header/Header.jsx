import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Bell, Settings, Sun } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      {/* Left: Logo and Brand */}
      <div className="header-left">
        <div className="logo-mark">
          <Sun size={20} strokeWidth={2.5} />
        </div>
        <div className="logo-text-container">
          <span className="logo-title">Solarist</span>
          <span className="logo-subtitle">Energy Intelligence</span>
        </div>
      </div>

      {/* Center: Navigation Pills */}
      <nav className="header-center">
        <NavLink to="/" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`} end>
          Overview
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
          Performance
        </NavLink>
        <NavLink to="/monitoring" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
          Monitoring
        </NavLink>
        <NavLink to="/optimization" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
          Optimization
        </NavLink>
      </nav>

      {/* Right: Actions and Status */}
      <div className="header-right">
        <div className="status-indicator-container">
          <div className="status-dot"></div>
          <span className="status-text">Online</span>
        </div>
        
        <button className="icon-button" aria-label="Notifications">
          <Bell size={20} />
        </button>
        
        <Link to="/settings" className="icon-button" aria-label="Settings">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
