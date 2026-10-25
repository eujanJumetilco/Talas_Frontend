'use client';

import { useEffect, useState } from 'react';
import { getStats } from '../lib/api';
import { toFilterParams } from '../lib/filters';

// Loads the statistics for the applied filters. Runs again when the filters change
// or when `reloadKey` changes (after a new report).
export default function useStats({ filters, reloadKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false; // set when a newer request replaces this one
    async function load() {
      setLoading(true);
      try {
        const data = await getStats(toFilterParams(filters));
        if (ignore) return;
        setStats(data);
        setError(null);
      } catch (e) {
        if (!ignore) setError(e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [filters, reloadKey]);

  return { stats, loading, error };
}
