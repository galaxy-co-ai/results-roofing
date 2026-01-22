import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ChatProvider, ChatWidget } from '@/components/features/support';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Results Roofing | Instant Roof Replacement Quotes',
    template: '%s | Results Roofing',
  },
  description:
    'Get your roof replacement quote in minutes. Compare packages, schedule installation, and pay online. Serving TX, GA, NC, and AZ.',
  keywords: [
    'roof replacement',
    'roofing quote',
    'roof estimate',
    'Texas roofing',
    'Georgia roofing',
    'North Carolina roofing',
    'Arizona roofing',
  ],
  authors: [{ name: 'Results Roofing' }],
  creator: 'Results Roofing',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://resultsroofing.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Results Roofing',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#C4A77D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ChatProvider>
          {children}
          <ChatWidget />
        </ChatProvider>
      </body>
    </html>
  );
}
