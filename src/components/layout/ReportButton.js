'use client';

import { useApp } from '../AppProvider';

// A button that opens the "Report an incident" dialog (the server-rendered home page uses it)
export default function ReportButton({ className = 'btn-primary', children }) {
  const { openReport } = useApp();
  return (
    <button type="button" onClick={openReport} className={className}>
      {children}
    </button>
  );
}
