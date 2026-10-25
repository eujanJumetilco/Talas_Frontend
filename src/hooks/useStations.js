'use client';

import { useEffect, useState } from 'react';
import { getStations } from '../lib/api';

// All police stations. They never change while the app is open, so they load once.
export default function useStations() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setStations(await getStations());
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, []);

  return { stations, error };
}
