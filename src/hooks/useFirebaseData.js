import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, fetchCurrentDashboardData, onSocketReconnect } from '../services/apiService';
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

  // Check data source mode (defaults to 'mern')
  const dataSource = import.meta.env.VITE_DATA_SOURCE || 'mern';

  // Use a ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  const syncMernState = useCallback(async () => {
    try {
      const currentData = await fetchCurrentDashboardData();
      if (isMountedRef.current) {
        setData(currentData);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      console.warn("[MERN] REST sync warning:", err.message);
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (dataSource === 'firebase') {
      // Legacy Firebase subscription mode (preserved for seamless rollback)
      let sensorsReady = false;
      let energyReady = false;
      let systemReady = false;

      const checkLoading = () => {
        if (sensorsReady && energyReady && systemReady && isMountedRef.current) {
          setLoading(false);
        }
      };

      let unsubSensors, unsubEnergy, unsubSystem, unsubHistory;

      try {
        unsubSensors = subscribeToSensors((val) => {
          if (!isMountedRef.current) return;
          setData(prev => ({ ...prev, sensors: val }));
          sensorsReady = true;
          checkLoading();
        });

        unsubEnergy = subscribeToEnergy((val) => {
          if (!isMountedRef.current) return;
          setData(prev => ({ ...prev, energy: val }));
          energyReady = true;
          checkLoading();
        });

        unsubSystem = subscribeToSystem((val) => {
          if (!isMountedRef.current) return;
          setData(prev => ({ ...prev, system: val }));
          systemReady = true;
          checkLoading();
        });

        unsubHistory = subscribeToHistory((val) => {
          if (!isMountedRef.current) return;
          setData(prev => ({ ...prev, history: val }));
        });
      } catch (err) {
        if (isMountedRef.current) {
          console.error("Failed to initialize Firebase listeners:", err);
          setError(err);
          setLoading(false);
        }
      }

      return () => {
        isMountedRef.current = false;
        if (unsubSensors) unsubSensors();
        if (unsubEnergy) unsubEnergy();
        if (unsubSystem) unsubSystem();
        if (unsubHistory) unsubHistory();
      };
    }

    // -------------------------------------------------------------------------
    // MERN Mode (Primary): MongoDB + Express + Socket.io Real-Time Synchronization
    // -------------------------------------------------------------------------
    let socket = null;
    let unsubReconnect = null;

    // Handler functions with memoized references to prevent multiple registrations
    const handleTelemetrySync = (initialState) => {
      if (!isMountedRef.current || !initialState) return;
      setData(prev => ({
        ...prev,
        sensors: initialState.sensors || prev.sensors,
        energy: initialState.energy || prev.energy,
        system: initialState.system || prev.system
      }));
      setLoading(false);
      setError(null);
    };

    const handleTelemetryUpdate = (updated) => {
      if (!isMountedRef.current || !updated) return;
      setData(prev => ({
        ...prev,
        sensors: updated.sensors || prev.sensors,
        energy: updated.energy || prev.energy,
        system: updated.system || prev.system
      }));
      setError(null);
      setLoading(false);
    };

    const handleSystemStatus = (statusUpdate) => {
      if (!isMountedRef.current || !statusUpdate) return;
      setData(prev => ({
        ...prev,
        system: {
          ...prev.system,
          status: statusUpdate.status !== undefined ? statusUpdate.status : prev.system?.status,
          relayStatus: statusUpdate.relayStatus !== undefined ? statusUpdate.relayStatus : prev.system?.relayStatus,
          lastUpdate: statusUpdate.lastUpdate !== undefined ? statusUpdate.lastUpdate : prev.system?.lastUpdate
        }
      }));
    };

    const handleHistoryNew = (newEvent) => {
      if (!isMountedRef.current || !newEvent) return;
      setData(prev => ({
        ...prev,
        history: [newEvent, ...(prev.history || [])]
      }));
    };

    const handleConnect = () => {
      if (isMountedRef.current) {
        setError(null);
      }
    };

    const handleConnectError = (err) => {
      if (isMountedRef.current && loading) {
        setError(err);
      }
    };

    const initMernData = async () => {
      // 1. Initial REST fetch for complete state synchronization
      await syncMernState();

      // 2. Register reconnection handler for automatic state resynchronization
      unsubReconnect = onSocketReconnect(() => {
        if (isMountedRef.current) {
          console.log('[MERN] Reconnection detected. Resynchronizing dashboard state...');
          syncMernState();
        }
      });

      // 3. Attach Socket.io listeners
      try {
        socket = getSocket();

        socket.on('telemetry:sync', handleTelemetrySync);
        socket.on('telemetry:update', handleTelemetryUpdate);
        socket.on('system:status', handleSystemStatus);
        socket.on('history:new', handleHistoryNew);
        socket.on('connect', handleConnect);
        socket.on('connect_error', handleConnectError);
      } catch (sockErr) {
        console.error("[MERN] Socket initialization error:", sockErr);
        if (isMountedRef.current) setError(sockErr);
      }
    };

    initMernData();

    return () => {
      isMountedRef.current = false;
      if (unsubReconnect) unsubReconnect();
      if (socket) {
        socket.off('telemetry:sync', handleTelemetrySync);
        socket.off('telemetry:update', handleTelemetryUpdate);
        socket.off('system:status', handleSystemStatus);
        socket.off('history:new', handleHistoryNew);
        socket.off('connect', handleConnect);
        socket.off('connect_error', handleConnectError);
      }
    };
  }, [dataSource, syncMernState]);

  return { data, loading, error };
};
