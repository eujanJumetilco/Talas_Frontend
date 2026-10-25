import Link from 'next/link';

// The TALAS logo: owl pin in a navy tile, then the wordmark. Used in the header and footer.
export default function BrandMark({ small = false }) {
  const tile = small ? 'h-8 w-8' : 'h-[37px] w-[37px]';
  return (
    <Link href="/" aria-label="TALAS home" className="flex items-center gap-2.5 text-[15px] font-extrabold tracking-[0.04em]">
      <span className={`grid ${tile} shrink-0 place-items-center overflow-hidden rounded-xl border border-[rgba(255,200,87,0.55)] bg-[#173d64]`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/talas-owl-pin.svg" alt="" className="h-[27px] w-[22px] object-contain" />
      </span>
      <span className="leading-tight">
        TALAS<span className="text-[#df9f24]">.</span>
        <small className="mt-0.5 block text-[8px] font-bold tracking-[0.17em] text-muted">COMMUNITY AWARENESS</small>
      </span>
    </Link>
  );
}
