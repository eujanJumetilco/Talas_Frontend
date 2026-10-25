'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { NAV_LINKS } from '../../lib/constants';
import { useApp } from '../AppProvider';
import BrandMark from './BrandMark';

// Floating rounded header on every page. On phones the links fold into a menu button.
export default function SiteHeader() {
  const pathname = usePathname();
  const { openReport } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-[3%] top-3 z-[1100] flex h-[65px] items-center justify-between rounded-[15px] border border-line bg-[rgba(247,251,255,0.94)] px-4 shadow-[0_10px_30px_rgba(32,74,112,0.12)] backdrop-blur-sm md:inset-x-[4.5%] md:top-[22px] md:h-[76px] md:rounded-[18px] md:px-[22px]">
      <BrandMark />

      <button
        type="button"
        className="flex flex-col gap-[5px] p-2.5 md:hidden"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="h-0.5 w-[21px] rounded bg-ink" />
        <span className="h-0.5 w-[21px] rounded bg-ink" />
      </button>

      <nav
        aria-label="Main navigation"
        className={`${menuOpen ? 'flex' : 'hidden'} absolute top-[73px] inset-x-0 flex-col rounded-[14px] border border-line bg-[rgba(247,251,255,0.98)] p-2 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-[clamp(18px,2.6vw,38px)] md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
      >
        {NAV_LINKS.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`px-3 py-3 text-xs font-bold transition-colors hover:text-[#1d4f80] md:px-0 md:py-0 md:text-[11px] ${active ? 'text-[#1d4f80]' : 'text-subtle'}`}
            >
              {link.label}
              {active && <span className="mt-2 hidden h-0.5 rounded bg-gold md:block" />}
            </Link>
          );
        })}
      </nav>

      <button type="button" onClick={openReport} className="btn-outline btn-small gap-2 max-md:w-[42px] max-md:px-0 max-md:text-[0px]" aria-label="Report an incident">
        <span className="h-[7px] w-[7px] rounded-full bg-gold" />
        <span className="max-md:hidden">Report an incident</span>
        <ArrowRight size={16} className="max-md:hidden" />
      </button>
    </header>
  );
}
