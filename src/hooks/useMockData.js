import { useState, useEffect } from 'react';

const mockData = {
  sensors: { voltage: 12.4, current: 1.25, temperature: 29.5, humidity: 62 },
  energy: { solarPower: 15.5, batteryLevel: 78, activeSource: "SOLAR" },
  system: { relayStatus: "OFF", status: "Online", lastUpdate: "10 seconds ago" }
};

export const useMockData = () => {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // In a real app, this would subscribe to a service.
  // For now, we just return the mock data immediately.
  
  return { data, loading, error };
};
