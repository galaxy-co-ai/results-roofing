import type { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Results Roofing privacy policy - how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white" id="main-content">
        {/* Hero */}
        <section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-[family-name:var(--font-sora)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-slate-500">
              Last updated: February 3, 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto prose prose-slate prose-headings:font-[family-name:var(--font-sora)] prose-headings:tracking-tight">
            <h2>Introduction</h2>
            <p>
              Results Roofing (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is
              committed to protecting your personal information. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you visit
              our website or use our services.
            </p>

            <h2>Information We Collect</h2>
            <h3>Information You Provide</h3>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Property address for roof measurements</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Communication preferences</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect:</p>
            <ul>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Pages visited and time spent on site</li>
              <li>Referring website information</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide accurate roof measurements and pricing</li>
              <li>Process payments and schedule installations</li>
              <li>Communicate about your project and updates</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our services and website experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Service providers who assist in our operations (payment processing, scheduling, email delivery)</li>
              <li>Installation crews assigned to your project</li>
              <li>Financing partners (only with your explicit consent)</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect
              your personal information against unauthorized access, alteration, disclosure,
              or destruction. This includes encryption, secure servers, and regular security
              assessments.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>

            <h2>Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience,
              analyze usage, and assist in our marketing efforts. You can control cookie
              preferences through your browser settings.
            </p>

            <h2>Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible
              for the privacy practices of these external sites. We encourage you to read
              their privacy policies.
            </p>

            <h2>Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 18. We do not knowingly
              collect personal information from children.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of
              any material changes by posting the new policy on this page and updating
              the &quot;Last updated&quot; date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices,
              please contact us at:
            </p>
            <p>
              Email: privacy@resultsroofing.com<br />
              Phone: 1-800-RESULTS
            </p>
          </div>
        </section>
      </main>
      <Footer minimal />
    </>
  );
}
