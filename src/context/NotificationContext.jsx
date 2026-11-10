import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getSocket,
  onSocketReconnect,
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationApi
} from '../services/apiService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  // Synchronize state from backend
  const loadNotifications = useCallback(async () => {
    try {
      const [listResult, unread] = await Promise.all([
        fetchNotifications(1, 30),
        fetchUnreadCount()
      ]);

      if (isMountedRef.current) {
        setNotifications(listResult.data || []);
        setUnreadCount(unread);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      console.warn('[Notifications] Failed to load notifications:', err.message);
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadNotifications();

    // Reconnection synchronization
    const unsubReconnect = onSocketReconnect(() => {
      if (isMountedRef.current) {
        console.log('[Notifications] Socket reconnected. Refreshing notifications...');
        loadNotifications();
      }
    });

    // Real-time Socket.io listener for new notifications
    let socket = null;
    const handleNewNotification = (newNotif) => {
      if (!isMountedRef.current || !newNotif) return;

      setNotifications((prev) => {
        // Prevent duplicate entries in state
        const exists = prev.some((n) => n.notificationId === newNotif.notificationId);
        if (exists) return prev;
        return [newNotif, ...prev];
      });

      if (!newNotif.read) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    try {
      socket = getSocket();
      socket.on('notification:new', handleNewNotification);
    } catch (err) {
      console.error('[Notifications] Socket listener error:', err);
    }

    return () => {
      isMountedRef.current = false;
      if (unsubReconnect) unsubReconnect();
      if (socket) {
        socket.off('notification:new', handleNewNotification);
      }
    };
  }, [loadNotifications]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) =>
        (n.notificationId === id || n.id === id) ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error('[Notifications] Failed to mark as read:', err);
      // Resynchronize on error
      loadNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error('[Notifications] Failed to mark all as read:', err);
      loadNotifications();
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    const target = notifications.find((n) => n.notificationId === id || n.id === id);
    setNotifications((prev) => prev.filter((n) => n.notificationId !== id && n.id !== id));
    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await deleteNotificationApi(id);
    } catch (err) {
      console.error('[Notifications] Failed to delete notification:', err);
      loadNotifications();
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

