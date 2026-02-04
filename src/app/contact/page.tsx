import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Results Roofing for questions about your roof replacement. Service areas include TX, GA, NC, AZ, and OK.',
};

const contactInfo = [
  {
    icon: Phone,
    label: 'Phone',
    value: '1-800-RESULTS',
    href: 'tel:+18007378587',
    description: 'Mon-Fri 8am-6pm, Sat 9am-2pm',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@resultsroofing.com',
    href: 'mailto:hello@resultsroofing.com',
    description: 'We respond within 24 hours',
  },
];

const serviceAreas = [
  { state: 'Texas', abbr: 'TX' },
  { state: 'Georgia', abbr: 'GA' },
  { state: 'North Carolina', abbr: 'NC' },
  { state: 'Arizona', abbr: 'AZ' },
  { state: 'Oklahoma', abbr: 'OK' },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-4">
              Get in <span className="text-blue-600">Touch</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Have questions about your quote or our services?
              We&apos;re here to help.
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {contactInfo.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                      <item.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <p className="font-semibold text-slate-900 text-lg">{item.value}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Hours */}
            <div className="bg-slate-50 rounded-xl p-6 mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-900">Business Hours</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Monday - Friday</span>
                  <p className="text-slate-900">8:00 AM - 6:00 PM</p>
                </div>
                <div>
                  <span className="text-slate-500">Saturday</span>
                  <p className="text-slate-900">9:00 AM - 2:00 PM</p>
                </div>
                <div>
                  <span className="text-slate-500">Sunday</span>
                  <p className="text-slate-900">Closed</p>
                </div>
              </div>
            </div>

            {/* Service Areas */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-900">Service Areas</h2>
              </div>
              <p className="text-slate-600 mb-4">
                We proudly serve homeowners across five states:
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span
                    key={area.abbr}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {area.state} ({area.abbr})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Quote CTA */}
        <section className="py-16 px-6 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Skip the Wait - Get an Instant Quote
            </h2>
            <p className="text-blue-100 mb-6">
              No phone call required. Just enter your address and get satellite-measured
              pricing in minutes.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Get My Quote
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-slate-200">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Results Roofing. All rights reserved.
            </span>
            <nav className="flex gap-6 text-sm text-slate-500">
              <Link href="/about" className="hover:text-slate-700">About</Link>
              <Link href="/services" className="hover:text-slate-700">Services</Link>
              <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
