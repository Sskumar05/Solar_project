import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  CheckCheck,
  Loader2
} from 'lucide-react';
import solaristLogo from '../../assets/solarist-logo-cropped.png';
import { useNotifications } from '../../context/NotificationContext';
import './Header.css';

// Helper for relative readable timestamps
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

// Map severity and event type to appropriate visual iconography
const getSeverityIcon = (severity, type) => {
  if (severity === 'error' || type === 'device_offline') {
    return <AlertTriangle size={16} className="notif-icon-error" />;
  }
  if (severity === 'warning' || type === 'battery_alert' || type === 'temperature_alert') {
    return <AlertTriangle size={16} className="notif-icon-warning" />;
  }
  if (severity === 'success' || type === 'device_reconnected') {
    return <CheckCircle2 size={16} className="notif-icon-success" />;
  }
  if (type === 'relay_switch') {
    return <Zap size={16} className="notif-icon-info" />;
  }
  return <Info size={16} className="notif-icon-info" />;
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="header-container">
      {/* Left: Logo and Brand */}
      <div className="header-left">
        <Link to="/" className="header-brand-link" aria-label="Solarist Dashboard Home">
          <img 
            src={solaristLogo} 
            alt="Solarist" 
            className="solarist-header-logo" 
          />
        </Link>
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
        
        {/* Notification Bell with Floating Dropdown */}
        <div className="notification-bell-wrapper" ref={dropdownRef}>
          <button 
            className={`icon-button notification-trigger ${isDropdownOpen ? 'active' : ''}`} 
            aria-label="Notifications"
            aria-expanded={isDropdownOpen}
            onClick={() => setIsDropdownOpen(prev => !prev)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge" aria-label={`${unreadCount} unread notifications`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Floating Dropdown Panel */}
          {isDropdownOpen && (
            <div className="notification-dropdown" role="dialog" aria-label="Notifications Panel">
              <div className="notification-header">
                <div className="notification-header-left">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="unread-count-pill">{unreadCount} new</span>
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button 
                    className="mark-all-read-btn"
                    onClick={() => markAllAsRead()}
                    title="Mark all notifications as read"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="notification-body">
                {loading && notifications.length === 0 ? (
                  <div className="notification-loading">
                    <Loader2 size={24} className="spinner" />
                    <span>Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="notification-empty">
                    <div className="empty-icon-wrap">
                      <CheckCircle2 size={32} />
                    </div>
                    <h5>All caught up!</h5>
                    <p>No active notifications or warnings.</p>
                  </div>
                ) : (
                  <div className="notification-list">
                    {notifications.map((item) => (
                      <div 
                        key={item.notificationId || item.id} 
                        className={`notification-item ${!item.read ? 'unread' : 'read'} severity-${item.severity || 'info'}`}
                        onClick={() => !item.read && markAsRead(item.notificationId || item.id)}
                      >
                        <div className={`notif-severity-bubble severity-${item.severity || 'info'}`}>
                          {getSeverityIcon(item.severity, item.type)}
                        </div>
                        <div className="notif-content">
                          <div className="notif-title-row">
                            <span className="notif-title">{item.title}</span>
                            <span className="notif-time">{formatTimeAgo(item.createdAt)}</span>
                          </div>
                          <p className="notif-message">{item.message}</p>
                        </div>
                        {!item.read && <span className="unread-dot" title="Unread"></span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <Link to="/settings" className="icon-button" aria-label="Settings">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
