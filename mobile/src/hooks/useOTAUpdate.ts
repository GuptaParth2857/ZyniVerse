import { useEffect, useCallback } from 'react';
import * as Updates from 'expo-updates';

export function useOTAUpdate() {
  const {
    isChecking,
    isDownloading,
    isUpdateAvailable,
    isUpdatePending,
    checkError,
  } = Updates.useUpdates();

  const downloadUpdate = useCallback(async () => {
    try {
      await Updates.fetchUpdateAsync();
      return true;
    } catch {
      return false;
    }
  }, []);

  const reloadNow = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {}
  }, []);

  useEffect(() => {
    if (isUpdateAvailable && !isUpdatePending && !isDownloading) {
      downloadUpdate();
    }
  }, [isUpdateAvailable, isUpdatePending, isDownloading, downloadUpdate]);

  const status = checkError
    ? 'check failed'
    : isUpdatePending
      ? 'ready — tap to restart'
      : isDownloading
        ? 'downloading…'
        : isUpdateAvailable
          ? 'update available'
          : isChecking
            ? 'checking…'
            : 'up to date';

  return {
    isChecking,
    isDownloading,
    isUpdateAvailable,
    isUpdatePending,
    status,
    runtimeVersion: Updates.runtimeVersion ?? null,
    downloadUpdate,
    reloadNow,
  };
}