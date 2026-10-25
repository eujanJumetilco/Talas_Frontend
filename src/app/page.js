import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ChartLine, MapPin, Route } from 'lucide-react';
import ReportButton from '../components/layout/ReportButton';
import '../components/home/home.css';

const FEATURES = [
  {
    href: '/crime-map',
    number: '01',
    icon: MapPin,
    iconClass: 'bg-[#e4f1ff] text-deep border-[rgba(45,103,159,0.2)]',
    title: 'Explore the crime map',
    text: 'View reported incidents by location and explore patterns on a map.',
  },
  {
    href: '/route-planner',
    number: '02',
    icon: Route,
    iconClass: 'bg-[#e1f5f5] text-[#286f88] border-[rgba(40,111,136,0.2)]',
    title: 'Plan a route',
    text: 'Review reported incidents around your planned journey.',
  },
  {
    href: '/insights',
    number: '03',
    icon: ChartLine,
    iconClass: 'bg-[#e4f4ee] text-mint border-[rgba(50,142,130,0.2)]',
    title: 'Understand the patterns',
    text: 'Explore trends by time, incident type, and area.',
  },
];

// The small picture at the top of each feature card
function FeatureArt({ index }) {
  if (index === 0) {
    return (
      <div className="art-box art-map" aria-hidden>
        <div className="art-map-grid" />
        <span className="art-pin" style={{ top: '29%', left: '32%' }} />
        <span className="art-pin" style={{ top: '55%', left: '62%' }} />
        <span className="art-pin" style={{ top: '22%', left: '74%' }} />
        <span className="art-orbit" />
        <span className="art-tag">METRO MANILA <b>↗</b></span>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="art-box art-route" aria-hidden>
        <span className="art-node" style={{ left: '9%', bottom: '17%' }} />
        <span className="art-node" style={{ left: '47%', top: '35%' }} />
        <span className="art-node" style={{ right: '8%', top: '18%' }} />
        <svg viewBox="0 0 260 130">
          <path d="M16 103 C55 103 51 36 98 47 S150 111 178 69 S216 25 246 27" className="art-route-wide" />
          <path d="M16 103 C55 103 51 36 98 47 S150 111 178 69 S216 25 246 27" className="art-route-line" />
        </svg>
        <span className="art-caption">ROUTE PREVIEW</span>
      </div>
    );
  }
  return (
    <div className="art-box art-chart" aria-hidden>
      <div className="art-chart-label">INCIDENT TRENDS <span>↗</span></div>
      <div className="art-bars">
        {[32, 52, 43, 75, 58, 91, 68, 82].map((height, i) => (
          <i key={i} style={{ height: `${height}%` }} />
        ))}
      </div>
      <div className="art-months"><span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[760px] items-center overflow-hidden border-b border-line bg-[#cfe3f8] md:min-h-[min(850px,100svh)]">
        <Image
          src="/images/manila-waterfront.jpg"
          alt="Waterfront skyline at golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] md:object-[center_56%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(234,244,255,0.97)_0%,rgba(234,244,255,0.9)_42%,rgba(234,244,255,0.47)_74%,rgba(234,244,255,0.2)_100%),linear-gradient(0deg,#eaf4ff_0%,rgba(234,244,255,0.05)_28%,rgba(234,244,255,0.12)_76%,rgba(234,244,255,0.8)_100%)]" />

        <div className="rise relative z-[2] mx-auto mt-12 mb-8 w-[86%] max-w-[720px] md:mt-[90px] md:ml-[10%] md:w-[90%] min-[1400px]:ml-[max(10%,calc((100vw-1160px)/2))]">
          <p className="eyebrow">Metro Manila · Philippines</p>
          <h1 className="mt-6 mb-5 max-w-[850px] font-display text-[clamp(45px,6.3vw,88px)] leading-[0.99] font-bold tracking-[-0.035em] text-ink">
            Know Manila.
            <br />
            <em className="text-deep not-italic">Let&apos;s move</em> <span className="text-deep">with awareness.</span>
          </h1>
          <p className="max-w-[475px] text-sm leading-[1.9] text-[#3f5e7d]">
            View crime reports, spot local patterns, and plan routes around Metro Manila with the reported crimes in mind.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/crime-map" className="btn-primary h-[50px] px-[21px]">
              Explore crime map <ArrowRight size={17} />
            </Link>
          </div>
          <p className="mt-7 flex items-center gap-2.5 text-[10px] text-[#3f5e7d]">
            <span className="pulse-dot h-[7px] w-[7px] rounded-full bg-mint" />
            Made especially for commuters
          </p>
        </div>

        <div className="absolute right-[4.5%] top-1/2 hidden text-[8px] font-extrabold tracking-[0.24em] text-subtle [writing-mode:vertical-rl] md:block">
          METRO MANILA · PHILIPPINES
        </div>
        <div className="absolute inset-x-[4.8%] bottom-5 z-[2] flex items-center gap-4 text-[8px] font-extrabold tracking-[0.18em] text-subtle">
          <span>01 / AWARENESS</span>
          <span className="h-px w-7 bg-ink/35 md:w-16" />
        </div>
      </section>

      {/* ---------- Intro + feature cards ---------- */}
      <section className="mx-auto grid w-[88%] max-w-[1160px] items-end gap-5 pt-[75px] pb-8 md:w-[90%] md:grid-cols-[1fr_0.75fr] md:gap-[60px] md:pt-[105px] md:pb-11">
        <div>
          <p className="eyebrow">For a safer Manila</p>
          <h2 className="mt-5 font-display text-[clamp(36px,4.5vw,56px)] leading-[1.04] font-bold tracking-[-0.035em] text-ink">
            Clarity for the
            <br />
            <span className="text-deep">everyday journey.</span>
          </h2>
        </div>
        <p className="max-w-[430px] text-[13px] leading-[1.9] text-[#526d87]">
          TALAS turns reported-crime data into maps, patterns and route information, so commuters can make more informed
          decisions about where and when they travel.
        </p>
      </section>

      <section aria-label="TALAS features" className="mx-auto grid w-[88%] max-w-[1160px] gap-3 md:w-[90%] md:grid-cols-3 md:gap-[15px]">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="group flex min-h-[330px] min-w-0 flex-col rounded-[18px] border border-line bg-panel p-5 shadow-[0_7px_18px_rgba(37,83,127,0.07)] transition duration-300 hover:-translate-y-[5px] hover:border-gold/80 hover:bg-[#fffdf8] hover:shadow-[0_14px_28px_rgba(37,83,127,0.13)] md:min-h-[350px] md:p-[22px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold tracking-[0.16em] text-[#587b9c]">{feature.number}</span>
                <span className={`grid h-[37px] w-[37px] place-items-center rounded-xl border ${feature.iconClass}`}>
                  <Icon size={20} strokeWidth={1.6} />
                </span>
              </div>
              <FeatureArt index={index} />
              <div className="mt-auto flex items-end justify-between gap-3">
                <div>
                  <h3 className="mb-2 font-display text-[17px] font-bold tracking-[-0.02em]">{feature.title}</h3>
                  <p className="max-w-[260px] text-[11px] leading-[1.75] text-muted">{feature.text}</p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold-soft bg-gold-soft text-ink transition group-hover:border-[#fff8e8] group-hover:bg-[#fff8e8]">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      {/* ---------- Report call to action ---------- */}
      <section id="report" className="mx-auto w-[88%] max-w-[1160px] py-[70px] md:w-[90%] md:py-[100px] md:pb-[90px]">
        <div className="relative grid min-h-[365px] overflow-hidden rounded-[20px] border border-line bg-[linear-gradient(120deg,#d3e8fc,#eaf4ff_70%)] md:grid-cols-[1fr_0.8fr]">
          <div className="relative z-[2] px-[25px] pt-[30px] pb-4 md:p-12">
            <p className="eyebrow">Community contribution</p>
            <h2 className="mt-5 font-display text-[clamp(38px,4.2vw,52px)] leading-[1.04] font-bold tracking-[-0.035em] text-ink">
              See something?
              <br />
              <span className="text-deep">Share a report.</span>
            </h2>
            <p className="mt-[18px] mb-6 max-w-[440px] text-xs leading-[1.9] text-[#456581]">
              Help keep our community informed. Be accurate, be respectful, and keep personal info private.
            </p>
            <ReportButton className="btn-primary h-[50px] px-[21px]">
              Report an incident <ArrowUpRight size={16} />
            </ReportButton>
            <p className="mt-4 text-[10px] text-muted">New reports appear on the map and in the statistics right away.</p>
          </div>
          <div aria-hidden className="relative grid min-h-[230px] place-items-center overflow-hidden md:min-h-[330px]">
            <div className="absolute h-[230px] w-[230px] rounded-full bg-gold-soft opacity-25 blur-[65px]" />
            <div className="orbit" />
            <div className="orbit orbit-b" />
            <div className="shield">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/talas-owl-pin.svg" alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Closing panel ---------- */}
      <section className="mx-auto w-[88%] max-w-[1160px] pb-[65px] md:w-[90%] md:pb-[95px]">
        <div className="relative min-h-[350px] overflow-hidden rounded-[20px] border border-[rgba(45,103,159,0.25)] bg-[linear-gradient(125deg,#b8d9f7,#9dc8ef_70%,#c9e2f9)] px-[25px] py-9 md:px-[60px] md:py-[54px]">
          <div className="absolute -top-[100px] -right-10 h-[300px] w-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(255,200,87,0.28),transparent_68%)] blur-[12px]" />
          <div className="relative z-[2]">
            <p className="eyebrow">Awareness starts here</p>
            <h2 className="mt-5 font-display text-[clamp(44px,5.3vw,66px)] leading-[1.04] font-bold tracking-[-0.035em] text-ink">
              Move smarter.
              <br />
              <span className="text-[#245d93]">Stay informed.</span>
            </h2>
            <p className="mt-[17px] mb-6 text-xs text-[#3f5e7d]">Start by exploring reported data around the places you know.</p>
            <Link href="/crime-map" className="btn-light h-[50px] px-[21px]">
              Open the crime map <ArrowUpRight size={16} />
            </Link>
          </div>
          <span className="absolute top-[18px] right-[22px] z-[2] text-[6px] font-extrabold tracking-[0.18em] text-ink/55 md:top-[35px] md:right-10 md:text-[8px]">
            TALAS / MMXXVI
          </span>
        </div>
      </section>
    </main>
  );
}
