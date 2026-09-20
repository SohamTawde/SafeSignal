import { useState, useEffect, useCallback } from 'react';
import { subscribeSyncStatus, syncNow } from '../services/syncManager';

export const useSyncStatus = () => {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null
  });

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, []);

  const handleSyncNow = useCallback(() => {
    return syncNow();
  }, []);

  return {
    ...status,
    syncNow: handleSyncNow
  };
};

export default useSyncStatus;
