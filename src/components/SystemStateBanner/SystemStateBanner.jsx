import React from 'react';
import { AlertTriangle, WifiOff, Loader, Clock } from 'lucide-react';
import './SystemStateBanner.css';

// How old (in ms) a lastUpdate can be before we warn about staleness
const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

const SystemStateBanner = ({ loading, error, data }) => {
  if (loading) {
    return (
      <div className="system-banner loading-banner">
        <Loader className="spin" size={18} />
        <span>Connecting to Firebase...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="system-banner error-banner">
        <AlertTriangle size={18} />
        <span>Unable to connect to Firebase. Check your network.</span>
      </div>
    );
  }

  const noData = !data?.sensors && !data?.energy && !data?.system;
  if (noData) {
    return (
      <div className="system-banner nodata-banner">
        <Loader size={18} />
        <span>Waiting for device data...</span>
      </div>
    );
  }

  // "Device Offline" — device actively reported a non-online status
  const statusStr = data?.system?.status;
  const isOffline = statusStr && statusStr.toLowerCase() !== 'online';
  if (isOffline) {
    return (
      <div className="system-banner offline-banner">
        <WifiOff size={18} />
        <span>Device Offline — reported status: {statusStr}</span>
      </div>
    );
  }

  // Staleness check — if lastUpdate timestamp can be parsed and is old, warn
  const rawLastUpdate = data?.system?.lastUpdate;
  if (rawLastUpdate) {
    // Try to parse as a date (works for ISO strings AND epoch ms)
    const parsed = new Date(rawLastUpdate);
    if (!isNaN(parsed.getTime())) {
      const ageMs = Date.now() - parsed.getTime();
      if (ageMs > STALE_THRESHOLD_MS) {
        const minutes = Math.floor(ageMs / 60000);
        return (
          <div className="system-banner stale-banner">
            <Clock size={18} />
            <span>
              No update from device in {minutes} minute{minutes !== 1 ? 's' : ''}.
              Last update: {rawLastUpdate}
            </span>
          </div>
        );
      }
    }
  }

  return null;
};

export default SystemStateBanner;
