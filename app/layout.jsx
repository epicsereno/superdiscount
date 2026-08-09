import './globals.css';
import { Archivo_Black, Inter, JetBrains_Mono } from 'next/font/google';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { seo, meta, nav } from '@/lib/store';

const archivo = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-archivo', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-face', display: 'swap' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: seo.site_title, template: `%s — ${meta.name}` },
  description: seo.site_description,
  keywords: seo.keywords,
  openGraph: {
    title: seo.site_title,
    description: seo.site_description,
    siteName: meta.name,
    type: 'website',
    url: siteUrl,
  },
  twitter: { card: 'summary_large_image', title: seo.site_title, description: seo.site_description },
};

export const viewport = { themeColor: '#0F1115' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <CartProvider>
          <a className="skip-link" href="#main">Skip to content</a>
          <Header announcement={nav.announcement_bar} primary={nav.primary} />
          <main id="main">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
