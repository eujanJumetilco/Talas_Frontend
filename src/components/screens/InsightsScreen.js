'use client';

import { useState } from 'react';
import { EMPTY_FILTERS } from '../../lib/filters';
import useStats from '../../hooks/useStats';
import { useApp } from '../AppProvider';
import FilterPanel from '../FilterPanel';
import StatsPanel from '../StatsPanel';

// Statistics: how many, what type, where and when crimes were reported, for the chosen filters
export default function InsightsScreen() {
  const { meta, metaError, reportVersion } = useApp();
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const { stats, loading, error } = useStats({ filters: appliedFilters, reloadKey: reportVersion });

  return (
    <main className="mx-auto w-[min(1200px,92%)] pt-[110px] pb-14 md:pt-[130px]">
      <div className="page-heading mb-6">
        <p className="eyebrow">Metro Manila awareness</p>
        <h1>
          Understand the <em>patterns.</em>
        </h1>
        <p>Explore reported incidents by type, time of day, day of week, source and area.</p>
      </div>

      <FilterPanel
        meta={meta}
        busy={loading}
        onSearch={setAppliedFilters}
        onReset={() => setAppliedFilters(EMPTY_FILTERS)}
      />

      <div className="mt-5 space-y-4">
        {metaError && <p className="msg-error">{metaError}</p>}
        <StatsPanel stats={stats} meta={meta} filters={appliedFilters} loading={loading} error={error} />
        <p className="text-[11px] leading-relaxed text-muted">
          A higher report count does not automatically mean a place is worse. Counts can be affected by how much is
          reported and by data availability.
        </p>
      </div>
    </main>
  );
}
