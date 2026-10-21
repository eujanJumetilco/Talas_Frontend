'use client';

import { useState } from 'react';
import { Crosshair, LoaderCircle, Send } from 'lucide-react';
import { createCrime } from '../lib/api';
import { METRO_MANILA_BOUNDS } from '../lib/constants';
import { manilaInputToUtcIso } from '../lib/format';
import { nowManilaInputValue } from '../lib/time';

const EMPTY_FORM = { type: '', source: 'COMMUNITY_REPORT', dateTime: '', address: '' };

function insideMetroManila({ lat, lng }) {
  const b = METRO_MANILA_BOUNDS;
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;
}

// Form for a new crime report. The location comes from a click on the map (draftLocation in page.js).
export default function ReportPanel({ meta, draftLocation, onClearDraft, onReportAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
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
    if (!draftLocation) return setError('Click the map to set the location.');
    if (!insideMetroManila(draftLocation)) return setError('Pick a spot within Metro Manila.');
    if (!form.type) return setError('Choose a crime type.');
    if (!form.dateTime) return setError('Enter the date and time.');

    setSending(true);
    setError(null);
    try {
      await createCrime({
        type: form.type,
        source: form.source,
        lat: draftLocation.lat,
        lng: draftLocation.lng,
        // The user typed Philippine time; the backend stores UTC
        occurredAt: manilaInputToUtcIso(form.dateTime),
        address: form.address.trim() || null,
      });
      setSuccess('Report added.');
      setForm(EMPTY_FORM);
      onClearDraft();
      // Refresh the map, hotspots and statistics so they include the new report
      onReportAdded();
    } catch (e) {
      // Keep the form values so the user can fix the problem and try again
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <p className="eyebrow">Add a crime report</p>

      <div>
        <span className="field-label">Location</span>
        <p
          className={`flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm ${
            draftLocation ? 'border-brand/50 bg-brand/5 font-semibold tabular-nums' : 'border-line text-muted'
          }`}
        >
          <Crosshair size={15} className="shrink-0 text-brand" />
          {draftLocation
            ? `${draftLocation.lat.toFixed(5)}, ${draftLocation.lng.toFixed(5)}`
            : 'Click the map to set the location'}
        </p>
      </div>

      <div>
        <label htmlFor="report-type" className="field-label">Crime type</label>
        <select
          id="report-type"
          className="input"
          required
          value={form.type}
          onChange={(e) => update('type', e.target.value)}
        >
          <option value="">Choose a type</option>
          {meta?.crimeTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="report-source" className="field-label">Source</label>
        <select
          id="report-source"
          className="input"
          value={form.source}
          onChange={(e) => update('source', e.target.value)}
        >
          {meta?.sources.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
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
        <label htmlFor="report-address" className="field-label">Address (optional)</label>
        <input
          id="report-address"
          className="input"
          maxLength={255}
          placeholder="Street, barangay, city"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
      </div>

      {error && <p className="msg-error">{error}</p>}
      {success && <p className="msg-success">{success}</p>}

      <button type="submit" className="btn-primary w-full" disabled={sending}>
        {sending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
        {sending ? 'Sending...' : 'Submit'}
      </button>
      <p className="text-xs text-muted">
        Reports are added to the shared map right away. Do not include anyone&apos;s personal information.
      </p>
    </form>
  );
}
