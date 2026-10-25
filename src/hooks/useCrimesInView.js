'use client';

import { useEffect, useRef, useState } from 'react';
import { getCrimes } from '../lib/api';
import { CRIME_LIMIT, MIN_ZOOM_FOR_CRIMES } from '../lib/constants';
import { toFilterParams } from '../lib/filters';

// Loads the crimes inside the visible map area.
// - Only when zoomed in far enough (MIN_ZOOM_FOR_CRIMES).
// - Only after the map has been still for 400 ms (so dragging does not send a request per frame).
// - A response that arrives after a newer request was started is ignored.
// `reloadKey` is a number; changing it loads the crimes again (used after a new report is added).
export default function useCrimesInView({ view, filters, reloadKey }) {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Counts the requests, so an old response can be recognised
  const requestRef = useRef(0);

  useEffect(() => {
    if (!view || view.zoom < MIN_ZOOM_FOR_CRIMES) return;

    const timer = setTimeout(async () => {
      const requestId = ++requestRef.current;
      setLoading(true);
      try {
        const data = await getCrimes({ ...toFilterParams(filters), ...view.bounds, limit: CRIME_LIMIT });
        if (requestId !== requestRef.current) return;
        setCrimes(data);
        setError(null);
      } catch (e) {
        if (requestId === requestRef.current) setError(e.message);
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    }, 400);

    // The map moved again before 400 ms passed: cancel this request
    return () => clearTimeout(timer);
  }, [view, filters, reloadKey]);

  return { crimes, loading, error };
}
