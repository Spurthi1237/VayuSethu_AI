import { useState, useEffect, useCallback, useRef } from 'react';
import type { LiveAirQualityState } from '../types/openMeteo';
import { fetchLiveAirQuality, REFRESH_INTERVAL_MS } from '../services/airQualityService';
import type { CPCBCalculationResult } from '../utils/cpcbAqiCalculator';

export interface UseAirQualityDataReturn {
  data: LiveAirQualityState | null;
  cpcbResult: CPCBCalculationResult | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdatedFormatted: string;
}

export function useAirQualityData(): UseAirQualityDataReturn {
  const [data, setData] = useState<LiveAirQualityState | null>(null);
  const [cpcbResult, setCpcbResult] = useState<CPCBCalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedFormatted, setLastUpdatedFormatted] = useState<string>('');

  const isMountedRef = useRef<boolean>(true);

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else if (!data) {
      setLoading(true);
    }
    setError(null);

    try {
      const liveState = await fetchLiveAirQuality();

      if (!isMountedRef.current) return;

      setData(liveState);
      setCpcbResult(liveState.cpcbScientificResult);
      setError(null);

      const timeStr = liveState.retrievedAt.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setLastUpdatedFormatted(`${timeStr} IST`);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const msg = err instanceof Error ? err.message : 'Failed to retrieve air quality data from Open-Meteo.';
      setError(msg);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [data]);

  // Initial load & 15-minute polling
  useEffect(() => {
    isMountedRef.current = true;
    loadData(false);

    const intervalId = setInterval(() => {
      loadData(false);
    }, REFRESH_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [loadData]);

  const refetch = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    data,
    cpcbResult,
    loading,
    refreshing,
    error,
    refetch,
    lastUpdatedFormatted,
  };
}
