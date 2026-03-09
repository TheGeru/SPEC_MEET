/**
 * ADMIN-DASHBOARD FEATURE — useDashboardData Hook
 *
 * Manages: fetching, loading state, auto-refresh (2 min).
 * React 19: No useCallback — compiler handles it.
 */

import { useState, useEffect } from "react";
import type { DashboardData } from "../models";
import { fetchDashboardStats } from "../services/adminDashboard.service";

const REFRESH_INTERVAL_MS = 120_000; // 2 minutes

interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchDashboardStats();
      setData(result);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al cargar el dashboard";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load + auto-refresh
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error, lastUpdated, refresh };
}