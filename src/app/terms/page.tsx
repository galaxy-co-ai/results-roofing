import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Results Roofing terms of service - the agreement governing use of our services and website.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="py-12 px-6 bg-slate-50 border-b border-slate-200">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">
              Terms of Service
            </h1>
            <p className="text-slate-600">
              Last updated: February 3, 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto prose prose-slate">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using the Results Roofing website and services, you agree
              to be bound by these Terms of Service. If you do not agree to these terms,
              please do not use our services.
            </p>

            <h2>Services Description</h2>
            <p>
              Results Roofing provides roof replacement services, including but not limited to:
            </p>
            <ul>
              <li>Satellite-based roof measurements and instant quotes</li>
              <li>Roof replacement and installation services</li>
              <li>Financing options through third-party providers</li>
              <li>Warranty coverage on materials and workmanship</li>
            </ul>

            <h2>Quote and Pricing</h2>
            <p>
              Quotes provided through our website are estimates based on satellite imagery
              and standard pricing. Final pricing may vary based on:
            </p>
            <ul>
              <li>On-site inspection findings</li>
              <li>Roof complexity and accessibility</li>
              <li>Required permits and local regulations</li>
              <li>Material availability and pricing changes</li>
              <li>Additional work discovered during installation</li>
            </ul>
            <p>
              All quotes are valid for 30 days from the date of issue unless otherwise stated.
            </p>

            <h2>Payment Terms</h2>
            <p>
              Payment is required according to the following schedule:
            </p>
            <ul>
              <li>Deposit: Due upon signing the contract</li>
              <li>Balance: Due upon completion of installation</li>
            </ul>
            <p>
              We accept major credit cards, ACH transfers, and financing through our
              approved lending partners. All payments are processed securely through Stripe.
            </p>

            <h2>Cancellation Policy</h2>
            <p>
              You may cancel your order under the following terms:
            </p>
            <ul>
              <li>Before materials are ordered: Full refund of deposit</li>
              <li>After materials are ordered: Deposit minus material costs</li>
              <li>After installation begins: No refund available</li>
            </ul>
            <p>
              To cancel, please contact us at least 48 hours before your scheduled
              installation date.
            </p>

            <h2>Warranty</h2>
            <p>
              Our roofing services include the following warranty coverage:
            </p>
            <ul>
              <li>Workmanship warranty: 5 years from installation date</li>
              <li>Material warranty: As provided by the manufacturer (25-50 years depending on package)</li>
            </ul>
            <p>
              Warranty coverage is void if the roof is damaged by acts of nature, improper
              modifications, or failure to maintain the roof according to manufacturer guidelines.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Results Roofing shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages
              arising from your use of our services.
            </p>
            <p>
              Our total liability for any claim arising from our services shall not exceed
              the amount paid by you for the specific service giving rise to the claim.
            </p>

            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Results Roofing, its officers,
              directors, employees, and agents from any claims, damages, or expenses
              arising from your violation of these terms or misuse of our services.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              All content on the Results Roofing website, including text, graphics, logos,
              and software, is the property of Results Roofing and protected by intellectual
              property laws. You may not reproduce, distribute, or create derivative works
              without our written permission.
            </p>

            <h2>Dispute Resolution</h2>
            <p>
              Any disputes arising from these terms or our services shall first be addressed
              through good-faith negotiation. If unresolved, disputes shall be settled through
              binding arbitration in accordance with the rules of the American Arbitration
              Association.
            </p>

            <h2>Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws
              of the State of Texas, without regard to its conflict of law provisions.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be
              effective immediately upon posting to this page. Your continued use of our
              services after changes are posted constitutes acceptance of the modified terms.
            </p>

            <h2>Severability</h2>
            <p>
              If any provision of these terms is found to be unenforceable, the remaining
              provisions will continue in full force and effect.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p>
              Email: legal@resultsroofing.com<br />
              Phone: 1-800-RESULTS
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-slate-200">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Results Roofing. All rights reserved.
            </span>
            <nav className="flex gap-6 text-sm text-slate-500">
              <Link href="/about" className="hover:text-slate-700">About</Link>
              <Link href="/services" className="hover:text-slate-700">Services</Link>
              <Link href="/contact" className="hover:text-slate-700">Contact</Link>
              <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
