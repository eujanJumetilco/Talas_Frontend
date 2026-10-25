import Link from 'next/link';

export const metadata = { title: 'Page not found' };

// Shown for any address that is not one of the app's pages
export default function NotFound() {
  return (
    <main className="mx-auto w-[min(1200px,92%)] pt-[110px] pb-14 md:pt-[130px]">
      <div className="page-heading">
        <p className="eyebrow">404</p>
        <h1>
          Page <em>not found.</em>
        </h1>
        <p>This address does not match any page. Check the link, or start again from the home page.</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
        <Link href="/crime-map" className="btn-outline">
          Open the crime map
        </Link>
      </div>
    </main>
  );
}
