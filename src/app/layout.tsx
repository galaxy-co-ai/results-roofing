import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from '@/components/providers/Providers';
import { ChatProvider, ChatWidget } from '@/components/features/support';
import { DocumentProvider, DocumentViewer } from '@/components/features/documents';
import { FAQProvider, FAQModal } from '@/components/features/faq';
import { FeedbackProvider, FeedbackWidget } from '@/components/features/feedback';
import { AdminAccessTrigger } from '@/components/features/admin';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Check if Clerk bypass is enabled for development
 */
const BYPASS_CLERK = process.env.BYPASS_CLERK === 'true';

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
  const content = (
    <html lang="en" className={inter.variable}>
      <body>
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

  // Skip ClerkProvider in bypass mode for development
  if (BYPASS_CLERK) {
    return content;
  }

  return <ClerkProvider>{content}</ClerkProvider>;
}
