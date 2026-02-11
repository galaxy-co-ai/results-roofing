import Link from 'next/link';
import { Shield, Award, Phone, Mail, Home } from 'lucide-react';

interface FooterProps {
  minimal?: boolean;
}

const QUICK_LINKS = [
  { label: 'Get a Quote', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
  { label: 'My Project', href: '/portal/dashboard' },
];

const SERVICE_AREAS = [
  'Texas (DFW, Austin, Houston)',
  'Georgia (Atlanta Metro)',
  'North Carolina (Charlotte, Raleigh)',
  'Arizona (Phoenix, Scottsdale)',
  'Oklahoma (OKC, Tulsa)',
];

export function Footer({ minimal = false }: FooterProps) {
  const year = new Date().getFullYear();

  if (minimal) {
    return (
      <footer className="py-6 px-6 border-t border-slate-200 bg-white" role="contentinfo">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-slate-500">&copy; {year} Results Roofing. All rights reserved.</p>
          <nav className="flex gap-5 text-sm text-slate-500" aria-label="Legal">
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700 transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-slate-900 text-slate-300" role="contentinfo">
      {/* Trust Badges */}
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <Shield size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Licensed & Insured</p>
              <p className="text-xs text-slate-400">Full liability coverage</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <Award size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">GAF Certified</p>
              <p className="text-xs text-slate-400">Master Elite Contractor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Home size={16} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-[family-name:var(--font-sora)] font-bold text-white tracking-tight">
                Results <span className="text-blue-400">Roofing</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premium roof replacement with transparent pricing. Get your instant quote in minutes — no sales calls, no home visits.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Service Areas */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Service Areas</h3>
            <ul className="space-y-2.5">
              {SERVICE_AREAS.map((area) => (
                <li key={area} className="text-sm text-slate-400">{area}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+18007378587" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <Phone size={14} />
                  1-800-RESULTS
                </a>
              </li>
              <li>
                <a href="mailto:hello@resultsroofing.com" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <Mail size={14} />
                  hello@resultsroofing.com
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500">Mon-Fri 8am-6pm</p>
              <p className="text-xs text-slate-500">Sat 9am-2pm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500">&copy; {year} Results Roofing. All rights reserved.</p>
          <nav className="flex gap-5 text-xs text-slate-500" aria-label="Legal">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
