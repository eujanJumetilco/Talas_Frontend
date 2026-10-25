'use client';

import { useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { EMPTY_FILTERS } from '../lib/filters';
import { utcToManilaDateStr } from '../lib/time';

// The filter form (shared by the crime map and insights pages).
// Nothing is loaded while typing: only the Search button (or Enter) applies the filters.
// Dates stay as Philippine calendar dates (YYYY-MM-DD) here; lib/filters.js converts them to UTC for the backend.
export default function FilterPanel({ meta, onSearch, onReset, busy }) {
  const [form, setForm] = useState(EMPTY_FILTERS);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    // YYYY-MM-DD strings compare correctly as text
    if (form.fromDate && form.toDate && form.fromDate > form.toDate) {
      setError('The "From" date must be on or before the "To" date.');
      return;
    }
    setError(null);
    onSearch(form);
  }

  function handleReset() {
    setForm(EMPTY_FILTERS);
    setError(null);
    onReset();
  }

  // The date pickers only allow days that have data
  const range = meta?.dateRange;
  const minDate = range?.earliest ? utcToManilaDateStr(range.earliest) : undefined;
  const maxDate = range?.latest ? utcToManilaDateStr(range.latest) : undefined;

  return (
    <form onSubmit={handleSubmit} className="panel p-5">
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="area" className="field-label">Area</label>
          <input
            id="area"
            className="input"
            placeholder="Street, barangay or city, e.g. Tondo"
            value={form.area}
            onChange={(e) => update('area', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="type" className="field-label">Crime type</label>
          <select id="type" className="input" value={form.type} onChange={(e) => update('type', e.target.value)}>
            <option value="">All types</option>
            {meta?.crimeTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="source" className="field-label">Source</label>
          <select id="source" className="input" value={form.source} onChange={(e) => update('source', e.target.value)}>
            <option value="">All sources</option>
            {meta?.sources.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fromDate" className="field-label">From</label>
          <input id="fromDate" type="date" className="input" min={minDate} max={maxDate} value={form.fromDate} onChange={(e) => update('fromDate', e.target.value)} />
        </div>
        <div>
          <label htmlFor="toDate" className="field-label">To (Philippine dates)</label>
          <input id="toDate" type="date" className="input" min={minDate} max={maxDate} value={form.toDate} onChange={(e) => update('toDate', e.target.value)} />
        </div>
      </div>

      {error && <p className="msg-error mt-3">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button type="submit" className="btn-primary" disabled={busy}>
          <Search size={16} /> Search
        </button>
        <button type="button" className="btn-outline" onClick={handleReset} disabled={busy}>
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </form>
  );
}
