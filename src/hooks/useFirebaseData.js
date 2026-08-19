import { useState, useEffect } from 'react';
import { 
  subscribeToSensors, 
  subscribeToEnergy, 
  subscribeToSystem, 
  subscribeToHistory 
} from '../services/firebaseService';

export const useFirebaseData = () => {
  const [data, setData] = useState({
    sensors: null,
    energy: null,
    system: null,
    history: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let sensorsReady = false;
    let energyReady = false;
    let systemReady = false;

    const checkLoading = () => {
      if (sensorsReady && energyReady && systemReady) {
        setLoading(false);
      }
    };

    let unsubSensors, unsubEnergy, unsubSystem, unsubHistory;

    try {
      unsubSensors = subscribeToSensors((val) => {
        setData(prev => ({ ...prev, sensors: val }));
        sensorsReady = true;
        checkLoading();
      });

      unsubEnergy = subscribeToEnergy((val) => {
        setData(prev => ({ ...prev, energy: val }));
        energyReady = true;
        checkLoading();
      });

      unsubSystem = subscribeToSystem((val) => {
        setData(prev => ({ ...prev, system: val }));
        systemReady = true;
        checkLoading();
      });

      unsubHistory = subscribeToHistory((val) => {
        setData(prev => ({ ...prev, history: val }));
      });

    } catch (err) {
      console.error("Failed to initialize Firebase listeners:", err);
      setError(err);
      setLoading(false);
    }

    return () => {
      // Clean up all listeners when component unmounts
      if (unsubSensors) unsubSensors();
      if (unsubEnergy) unsubEnergy();
      if (unsubSystem) unsubSystem();
      if (unsubHistory) unsubHistory();
    };
  }, []);

  return { data, loading, error };
};
