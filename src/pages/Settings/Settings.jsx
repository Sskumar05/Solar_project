import React, { useState } from 'react';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { Save } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    solarVoltageThreshold: 14.0,
    batteryLowThreshold: 20,
    batteryFullThreshold: 95,
    tempWarningThreshold: 45,
    autoOptimization: true,
    refreshInterval: '10s',
    defaultChartRange: 'Today'
  });

  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="settings-page">
      <SectionHeader title="Settings" subtitle="System configuration and display preferences" />
      
      <form className="settings-form" onSubmit={handleSave}>
        
        {/* System Settings */}
        <div className="settings-card card-base">
          <h4>System Settings</h4>
          
          <div className="form-group">
            <label htmlFor="solarVoltageThreshold">Solar Voltage Threshold (V)</label>
            <input 
              type="number" 
              step="0.1" 
              id="solarVoltageThreshold" 
              name="solarVoltageThreshold" 
              value={formData.solarVoltageThreshold} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="batteryLowThreshold">Battery Low Threshold (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                id="batteryLowThreshold" 
                name="batteryLowThreshold" 
                value={formData.batteryLowThreshold} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="batteryFullThreshold">Battery Full Threshold (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                id="batteryFullThreshold" 
                name="batteryFullThreshold" 
                value={formData.batteryFullThreshold} 
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="tempWarningThreshold">Temperature Warning Threshold (°C)</label>
            <input 
              type="number" 
              id="tempWarningThreshold" 
              name="tempWarningThreshold" 
              value={formData.tempWarningThreshold} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-group toggle-group">
            <label htmlFor="autoOptimization">Auto Optimization</label>
            <label className="switch">
              <input 
                type="checkbox" 
                id="autoOptimization" 
                name="autoOptimization" 
                checked={formData.autoOptimization} 
                onChange={handleChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* Display Settings */}
        <div className="settings-card card-base">
          <h4>Display Settings</h4>
          
          <div className="form-group">
            <label htmlFor="refreshInterval">Refresh Interval</label>
            <select 
              id="refreshInterval" 
              name="refreshInterval" 
              value={formData.refreshInterval} 
              onChange={handleChange}
            >
              <option value="5s">5 Seconds</option>
              <option value="10s">10 Seconds</option>
              <option value="30s">30 Seconds</option>
              <option value="60s">60 Seconds</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="defaultChartRange">Default Chart Time Range</label>
            <select 
              id="defaultChartRange" 
              name="defaultChartRange" 
              value={formData.defaultChartRange} 
              onChange={handleChange}
            >
              <option value="Today">Today</option>
              <option value="7 Days">7 Days</option>
              <option value="30 Days">30 Days</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="save-btn">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>
      
      {showToast && (
        <div className="toast-notification">
          Settings saved successfully!
        </div>
      )}
    </div>
  );
};

export default Settings;
