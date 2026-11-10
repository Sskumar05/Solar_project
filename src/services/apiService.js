import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let socket = null;
const reconnectCallbacks = new Set();

export const onSocketReconnect = (cb) => {
  reconnectCallbacks.add(cb);
  return () => reconnectCallbacks.delete(cb);
};

export const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    socket.on('connect', () => {
      console.log(`[Socket.io] Connected to MERN Backend at ${BACKEND_URL}`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`[Socket.io] Reconnected after ${attemptNumber} attempts. Resynchronizing state...`);
      reconnectCallbacks.forEach((cb) => {
        try { cb(); } catch (e) { console.error('Error in reconnect callback:', e); }
      });
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket.io] Attempting to reconnect (#${attempt})...`);
    });

    socket.on('reconnect_error', (err) => {
      console.warn(`[Socket.io] Reconnection error: ${err.message}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Disconnected from MERN Backend: ${reason}`);
    });

    socket.on('connect_error', (err) => {
      console.warn(`[Socket.io] Connection warning: ${err.message}`);
    });
  }
  return socket;
};

// Fetch initial snapshot from Express REST API
export const fetchCurrentDashboardData = async () => {
  const res = await fetch(`${BACKEND_URL}/api/dashboard/current`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const result = await res.json();
  return result.data;
};

// Fetch historical events
export const fetchHistory = async () => {
  const res = await fetch(`${BACKEND_URL}/api/dashboard/history`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const result = await res.json();
  return result.data;
};

// Fetch backend health status
export const fetchHealth = async () => {
  const res = await fetch(`${BACKEND_URL}/api/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
};

// -------------------------------------------------------------
// Notification REST APIs
// -------------------------------------------------------------

// Fetch notifications with pagination and unreadCount
export const fetchNotifications = async (page = 1, limit = 20) => {
  const res = await fetch(`${BACKEND_URL}/api/notifications?page=${page}&limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }
  return res.json();
};

// Fetch unread notifications count
export const fetchUnreadCount = async () => {
  const res = await fetch(`${BACKEND_URL}/api/notifications/unread-count`);
  if (!res.ok) {
    throw new Error(`Failed to fetch unread count: ${res.status}`);
  }
  const data = await res.json();
  return data.unreadCount ?? 0;
};

// Mark single notification as read
export const markNotificationAsRead = async (id) => {
  const res = await fetch(`${BACKEND_URL}/api/notifications/${id}/read`, {
    method: 'PATCH'
  });
  if (!res.ok) {
    throw new Error(`Failed to mark notification as read: ${res.status}`);
  }
  return res.json();
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const res = await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
    method: 'PATCH'
  });
  if (!res.ok) {
    throw new Error(`Failed to mark all as read: ${res.status}`);
  }
  return res.json();
};

// Delete notification
export const deleteNotificationApi = async (id) => {
  const res = await fetch(`${BACKEND_URL}/api/notifications/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error(`Failed to delete notification: ${res.status}`);
  }
  return res.json();
};

// Source description helper (identical logic)
export const getSourceDescription = (activeSource) => {
  if (!activeSource) return '--';
  const s = String(activeSource).toLowerCase();
  if (s === 'solar') return 'Running on solar power — clean and free energy.';
  if (s === 'battery') return 'Drawing from battery backup — solar unavailable.';
  if (s === 'grid') return 'Using grid supply — battery and solar insufficient.';
  return `Active source: ${activeSource}`;
};
