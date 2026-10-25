import { Baloo_2, DM_Sans } from 'next/font/google';
import './globals.css';
import AppProvider from '../components/AppProvider';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';

// The two fonts from the design: Baloo 2 for headings, DM Sans for everything else
const baloo = Baloo_2({ variable: '--font-baloo', subsets: ['latin'], weight: ['600', '700', '800'] });
const dmSans = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: {
    default: 'TALAS — Travel-Awareness Alert, Location-Based Analytics, and Safety-Routing System',
    template: '%s | TALAS',
  },
  description:
    'TALAS helps Metro Manila communities explore reported crime data and make more informed route decisions.',
};

export const viewport = { themeColor: '#eaf4ff' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${baloo.variable} ${dmSans.variable}`}>
      <body>
        {/* Two soft blurred color blobs behind the page, like the design */}
        <div aria-hidden className="pointer-events-none fixed top-[12%] -left-56 -z-10 h-[420px] w-[420px] rounded-full bg-[#72aee8] opacity-[0.08] blur-[110px]" />
        <div aria-hidden className="pointer-events-none fixed top-[48%] -right-56 -z-10 h-[360px] w-[360px] rounded-full bg-[#85d4cf] opacity-[0.08] blur-[110px]" />
        <AppProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </AppProvider>
      </body>
    </html>
  );
}
