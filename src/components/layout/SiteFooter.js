import { DATA_NOTE, USE_MOCKS } from '../../lib/constants';
import BrandMark from './BrandMark';

// Footer on every page. It also carries the required note about the data.
export default function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-[6%] py-6 md:flex-nowrap md:gap-8 md:px-[5%]">
      <BrandMark small />
      <p className="order-3 basis-full text-[11px] leading-relaxed text-muted md:order-none md:basis-auto md:max-w-[520px]">
        {DATA_NOTE}
      </p>
      {USE_MOCKS && (
        <span className="rounded-full border border-gold px-2 py-0.5 text-[10px] font-bold text-ink">Sample data</span>
      )}
      <span className="ml-auto text-[9px] tracking-[0.1em] whitespace-nowrap text-muted">© 2026 TALAS</span>
    </footer>
  );
}
