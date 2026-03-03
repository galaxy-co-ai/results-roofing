import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Sora, Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { ChatProvider, ChatWidget } from '@/components/features/support';
import { DocumentProvider, DocumentViewer } from '@/components/features/documents';
import { FAQProvider, FAQModal } from '@/components/features/faq';
import { FeedbackProvider, FeedbackWidget } from '@/components/features/feedback';
import { AdminAccessTrigger } from '@/components/features/admin';
import '@/styles/globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Results Roofing | Instant Roof Replacement Quotes',
    template: '%s | Results Roofing',
  },
  description:
    'Get your roof replacement quote in minutes. Compare packages, schedule installation, and pay online. Serving TX, GA, NC, AZ, and OK.',
  keywords: [
    'roof replacement',
    'roofing quote',
    'roof estimate',
    'Texas roofing',
    'Georgia roofing',
    'North Carolina roofing',
    'Arizona roofing',
    'Oklahoma roofing',
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
    images: [
      {
        url: '/brand/github/github-banner.png',
        width: 1200,
        height: 630,
        alt: 'Results Roofing - Instant Roof Replacement Quotes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Results Roofing | Instant Roof Replacement Quotes',
    description: 'Get your roof replacement quote in minutes.',
    images: ['/brand/github/github-banner.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
};

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Root Layout
 *
 * Note: ClerkProvider is NOT included here to avoid loading Clerk JS (~157KB)
 * on pages that don't need auth (homepage, quote flow).
 *
 * Clerk is loaded via route-specific layouts:
 * - src/app/(auth)/layout.tsx - for /sign-in, /sign-up
 * - src/app/portal/layout.tsx - for /portal/*
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {gtmId && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
      </head>
      <body className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} font-[family-name:var(--font-inter)]`}>
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <Providers>
          <ChatProvider>
            <DocumentProvider>
              <FAQProvider>
                <FeedbackProvider>
                  {children}
                  <ChatWidget />
                  <DocumentViewer />
                  <FAQModal />
                  <FeedbackWidget />
                  <AdminAccessTrigger />
                </FeedbackProvider>
              </FAQProvider>
            </DocumentProvider>
          </ChatProvider>
        </Providers>
      </body>
    </html>
  );
}
