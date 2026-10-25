'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Crosshair, LoaderCircle, Send } from 'lucide-react';
import { createCrime } from '../lib/api';
import { METRO_MANILA_BOUNDS } from '../lib/constants';
import { manilaInputToUtcIso } from '../lib/format';
import { nowManilaInputValue } from '../lib/time';

// Leaflet needs the browser, so the picker map is never rendered on the server
const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[220px] rounded-[10px] bg-soft" />,
});

const EMPTY_FORM = { type: '', source: 'COMMUNITY_REPORT', dateTime: '', address: '', confirmed: false };

function insideMetroManila({ lat, lng }) {
  const b = METRO_MANILA_BOUNDS;
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;
}

// The form inside the dialog. It only exists while the dialog is open, so it starts empty every time.
function ReportForm({ meta, onReportAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [location, setLocation] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // Latest allowed date and time (now, in Philippine time); refreshed whenever the field is focused
  const [maxDateTime, setMaxDateTime] = useState(nowManilaInputValue);

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setSuccess(null); // the user is working on a new report
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;
    setSuccess(null);

    // Checks before sending (the backend checks again)
    if (!location) return setError('Click the map to set the location.');
    if (!insideMetroManila(location)) return setError('Pick a spot within Metro Manila.');
    if (!form.type) return setError('Choose a crime type.');
    if (!form.dateTime) return setError('Enter the date and time.');

    setSending(true);
    setError(null);
    try {
      await createCrime({
        type: form.type,
        source: form.source,
        lat: location.lat,
        lng: location.lng,
        // The user typed Philippine time; the backend stores UTC
        occurredAt: manilaInputToUtcIso(form.dateTime),
        address: form.address.trim() || null,
      });
      setSuccess('Report added.');
      setForm(EMPTY_FORM);
      setLocation(null);
      // Tell the pages to reload the map, hotspots and statistics
      onReportAdded();
    } catch (e) {
      // Keep the form values so the user can fix the problem and try again
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
      <div>
        <span className="field-label">Location</span>
        <LocationPicker location={location} onPick={setLocation} />
        <p className={`mt-2 flex items-center gap-2 text-xs ${location ? 'font-semibold tabular-nums' : 'text-muted'}`}>
          <Crosshair size={14} className="shrink-0 text-deep" />
          {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Click the map to set the location'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="report-type" className="field-label">Crime type</label>
          <select id="report-type" className="input" required value={form.type} onChange={(e) => update('type', e.target.value)}>
            <option value="">Select a type</option>
            {meta?.crimeTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="report-source" className="field-label">Source</label>
          <select id="report-source" className="input" value={form.source} onChange={(e) => update('source', e.target.value)}>
            {meta?.sources.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="report-time" className="field-label">Date and time (Philippine time)</label>
        <input
          id="report-time"
          type="datetime-local"
          className="input"
          required
          max={maxDateTime}
          onFocus={() => setMaxDateTime(nowManilaInputValue())}
          value={form.dateTime}
          onChange={(e) => update('dateTime', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="report-address" className="field-label">Location details (optional)</label>
        <input
          id="report-address"
          className="input"
          maxLength={255}
          placeholder="Street, barangay, city"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-subtle">
        <input
          type="checkbox"
          required
          className="mt-0.5 accent-deep"
          checked={form.confirmed}
          onChange={(e) => update('confirmed', e.target.checked)}
        />
        I confirm this information is accurate to the best of my knowledge.
      </label>

      {error && <p className="msg-error">{error}</p>}
      {success && <p className="msg-success">{success}</p>}

      <button type="submit" className="btn-primary w-full" disabled={sending}>
        {sending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
        {sending ? 'Sending...' : 'Submit report'}
      </button>
      <p className="text-[11px] text-muted">
        Reports are added to the shared map right away. Do not include anyone&apos;s personal information.
      </p>
    </form>
  );
}

// The "Report an incident" pop-up, built on the browser's <dialog> element
export default function ReportDialog({ open, meta, onClose, onReportAdded }) {
  const dialogRef = useRef(null);

  // Open or close the <dialog> when the `open` prop changes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto max-h-[90vh] w-[min(560px,calc(100%-30px))] overflow-y-auto rounded-[22px] border border-line bg-panel p-[30px] text-ink shadow-[0_24px_70px_rgba(23,53,83,0.28)] backdrop:bg-[rgba(17,43,70,0.5)] backdrop:backdrop-blur-sm"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close report form"
          className="h-[33px] w-[33px] rounded-full border border-line bg-[#e5f1fd] text-2xl leading-none text-ink"
        >
          ×
        </button>
      </div>
      <p className="text-[9px] font-extrabold tracking-[0.2em] text-deep">COMMUNITY REPORT</p>
      <h2 className="mt-2 font-display text-[34px] leading-tight font-bold tracking-[-0.03em]">
        Report an <em className="text-deep not-italic">incident.</em>
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-subtle">
        Click the map to mark where it happened, then fill in the details.
      </p>
      {open && <ReportForm meta={meta} onReportAdded={onReportAdded} />}
    </dialog>
  );
}
