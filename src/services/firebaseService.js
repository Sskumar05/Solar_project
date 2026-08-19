import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';

// ---------------------------------------------------------------------------
// Type-safe parsers — ESP8266 may send numbers as strings or floats
// ---------------------------------------------------------------------------
const toFloat = (v) => {
  if (v === null || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};

const toUpperStr = (v) => {
  if (v === null || v === undefined) return null;
  return String(v).toUpperCase().trim();
};

// Format timestamp from ESP8266: handles ISO string, epoch ms, or raw string
const formatTimestamp = (ts) => {
  if (ts === null || ts === undefined) return null;
  // Epoch number (e.g. 1724067600000 from Firebase.set millis)
  if (typeof ts === 'number') {
    return new Date(ts).toLocaleString();
  }
  // ISO or other string — try to parse
  const d = new Date(ts);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString();
  }
  // Unrecognised format — return as-is
  return String(ts);
};

// ---------------------------------------------------------------------------
// Source description helper
// ---------------------------------------------------------------------------
export const getSourceDescription = (activeSource) => {
  if (!activeSource) return '--';
  const s = activeSource.toLowerCase();
  if (s === 'solar') return 'Running on solar power — clean and free energy.';
  if (s === 'battery') return 'Drawing from battery backup — solar unavailable.';
  if (s === 'grid') return 'Using grid supply — battery and solar insufficient.';
  return `Active source: ${activeSource}`;
};

// ---------------------------------------------------------------------------
// Firebase listeners
// ---------------------------------------------------------------------------
export const subscribeToSensors = (callback) => {
  const sensorsRef = ref(db, 'solarSystem/sensors');
  const unsubscribe = onValue(sensorsRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) { callback(null); return; }
    callback({
      voltage:     toFloat(val.voltage),
      current:     toFloat(val.current),
      temperature: toFloat(val.temperature),
      humidity:    toFloat(val.humidity),
    });
  }, (error) => {
    console.error('Firebase sensors read failed:', error);
  });
  return unsubscribe;
};

export const subscribeToEnergy = (callback) => {
  const energyRef = ref(db, 'solarSystem/energy');
  const unsubscribe = onValue(energyRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) { callback(null); return; }
    callback({
      solarPower:   toFloat(val.solarPower),
      batteryLevel: toFloat(val.batteryLevel),
      activeSource: val.activeSource ? String(val.activeSource) : null,
    });
  }, (error) => {
    console.error('Firebase energy read failed:', error);
  });
  return unsubscribe;
};

export const subscribeToSystem = (callback) => {
  const systemRef = ref(db, 'solarSystem/system');
  const unsubscribe = onValue(systemRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) { callback(null); return; }
    callback({
      relayStatus: toUpperStr(val.relayStatus), // normalise: "on"/"ON"/"On" → "ON"
      status:      val.status ? String(val.status) : null,
      lastUpdate:  formatTimestamp(val.lastUpdate),
    });
  }, (error) => {
    console.error('Firebase system read failed:', error);
  });
  return unsubscribe;
};

export const subscribeToHistory = (callback) => {
  const historyRef = ref(db, 'solarSystem/history');
  const unsubscribe = onValue(historyRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) { callback([]); return; }
    // Convert Firebase object (keyed by push IDs) to sorted array
    const historyArray = Object.entries(val)
      .map(([key, item]) => ({ id: key, ...item }))
      .sort((a, b) => {
        // Sort descending by time if numeric, else leave in insertion order
        const ta = typeof a.time === 'number' ? a.time : 0;
        const tb = typeof b.time === 'number' ? b.time : 0;
        return tb - ta;
      });
    callback(historyArray);
  }, (error) => {
    console.error('Firebase history read failed:', error);
  });
  return unsubscribe;
};
