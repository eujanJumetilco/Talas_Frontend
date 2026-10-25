'use client';

import { useEffect, useState } from 'react';
import { getHotspots } from '../lib/api';

// Hotspots for the whole map. They load again when `reloadKey` changes,
// because a new report can change them.
export default function useHotspots(reloadKey) {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setHotspots(await getHotspots());
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reloadKey]);

  return { hotspots, loading, error };
}
