import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

// Basic security headers sent with every page (the page cannot be framed, file types are not guessed,
// and other sites only see our domain, not the full URL, when a user follows a link)
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  // NEXT_PUBLIC_ values are copied into the browser code when the app is built. If the backend URL is missing
  // in a production build, the deployed site would silently call http://localhost:8080, so stop the build instead.
  const usesMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';
  if (phase === PHASE_PRODUCTION_BUILD && !usesMocks && !process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not set. Set it to the backend URL (for example https://talas-api.example.com), ' +
        'or set NEXT_PUBLIC_USE_MOCKS=true to build with the sample data.',
    );
  }

  return {
    // Do not advertise "X-Powered-By: Next.js"
    poweredByHeader: false,

    async headers() {
      return [{ source: '/:path*', headers: SECURITY_HEADERS }];
    },

    turbopack: {
      // This folder is the project root (stops Next.js from looking at lock files in parent folders)
      root: import.meta.dirname,
      rules: {
        '*.css': {
          loaders: ['@tailwindcss/turbopack'],
          as: '*.css',
        },
      },
    },
  };
}
