'use client';

// Things every page needs: the dropdown data from /api/meta and the "Report an incident" dialog.
// A page reads them with useApp(). `reportVersion` goes up by one each time a report is saved,
// so pages can reload the data that a new report changes.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMeta } from '../lib/api';
import ReportDialog from './ReportDialog';

const AppContext = createContext(null);

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside <AppProvider>.');
  return value;
}

export default function AppProvider({ children }) {
  const [meta, setMeta] = useState(null);
  const [metaError, setMetaError] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportVersion, setReportVersion] = useState(0);

  useEffect(() => {
    async function loadMeta() {
      try {
        setMeta(await getMeta());
      } catch (e) {
        setMetaError(e.message);
      }
    }
    loadMeta();
  }, []);

  const openReport = useCallback(() => setReportOpen(true), []);
  const closeReport = useCallback(() => setReportOpen(false), []);
  const handleReportAdded = useCallback(() => setReportVersion((version) => version + 1), []);

  const value = useMemo(
    () => ({ meta, metaError, reportVersion, openReport }),
    [meta, metaError, reportVersion, openReport],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <ReportDialog open={reportOpen} meta={meta} onClose={closeReport} onReportAdded={handleReportAdded} />
    </AppContext.Provider>
  );
}
