'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Shown in place of a page when it crashes while running (the header and footer stay visible).
// Error pages must be client components.
export default function ErrorPage({ error, retry }) {
  // Keep the details in the browser console so the problem can still be found after deployment
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-[min(1200px,92%)] pt-[110px] pb-14 md:pt-[130px]">
      <div className="page-heading">
        <p className="eyebrow">Something went wrong</p>
        <h1>
          This page <em>stopped working.</em>
        </h1>
        <p>Try again, or go back to the home page. If it keeps happening, reload the browser tab.</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {/* retry() loads the page again inside the same tab */}
        <button type="button" className="btn-primary" onClick={() => retry()}>
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
