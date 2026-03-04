'use client';

import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Home,
  CloudLightning,
  Search,
  Wrench,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

interface FormData {
  serviceType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

const SERVICE_TYPES = [
  { label: 'Roof Replacement', icon: Home },
  { label: 'Storm Damage', icon: CloudLightning },
  { label: 'Roof Inspection', icon: Search },
  { label: 'Gutters & More', icon: Wrench },
];

const STEPS = ['Service', 'Address', 'Contact'] as const;

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length === 10;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ServiceRequestForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<FormData>({
    serviceType: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  function canAdvance(): boolean {
    if (step === 0) return !!data.serviceType;
    if (step === 1) return !!(data.address && data.city && data.state && data.zip);
    if (step === 2) return !!(data.name && isValidPhone(data.phone) && isValidEmail(data.email));
    return false;
  }

  async function handleSubmit() {
    if (!canAdvance()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Something went wrong');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── Success state ─── */
  if (submitted) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-[family-name:var(--font-sora)] text-xl font-bold text-slate-900 mb-2">
          Request Received!
        </h3>
        <p className="text-slate-600 text-sm">
          We&apos;ll get back to you within 24 hours. Check your email for confirmation.
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors';

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-xl">
      {/* ─── Step indicators ─── */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                i <= step ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 h-px ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ─── Step 1: Service Type ─── */}
      {step === 0 && (
        <div>
          <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold text-slate-900 mb-1">
            What do you need?
          </h3>
          <p className="text-sm text-slate-500 mb-4">Select a service type</p>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_TYPES.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => setData({ ...data, serviceType: label })}
                className={`flex items-center gap-3 p-4 rounded-lg border text-sm font-medium text-left transition-all ${
                  data.serviceType === label
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Step 2: Address ─── */}
      {step === 1 && (
        <div>
          <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold text-slate-900 mb-1">
            Property address
          </h3>
          <p className="text-sm text-slate-500 mb-4">Where is the property located?</p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Street address"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              className={inputClass}
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="State"
                value={data.state}
                onChange={(e) => setData({ ...data, state: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="ZIP"
                value={data.zip}
                onChange={(e) => setData({ ...data, zip: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 3: Contact Info ─── */}
      {step === 2 && (
        <div>
          <h3 className="font-[family-name:var(--font-sora)] text-lg font-bold text-slate-900 mb-1">
            Your contact info
          </h3>
          <p className="text-sm text-slate-500 mb-4">How should we reach you?</p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Full name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={data.phone}
              onChange={(e) =>
                setData({ ...data, phone: formatPhoneNumber(e.target.value) })
              }
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Email address"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className={inputClass}
            />
            <textarea
              placeholder="Tell us more about your project (optional)"
              value={data.message}
              onChange={(e) => setData({ ...data, message: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      {/* ─── Navigation ─── */}
      <div className="flex items-center justify-between mt-6">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={() => canAdvance() && setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canAdvance() || submitting}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Submit Request
                <ArrowRight size={14} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
