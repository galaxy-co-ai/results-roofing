/**
 * Integration Adapters
 * Centralized exports for external service adapters
 *
 * Status (Updated 2026-03-03):
 * ✅ google-solar - Satellite roof measurements via Google Solar API
 * ✅ gaf - GAF QuickMeasure async roof reports via Digital Design API
 * ✅ resend - Email delivery complete (MIGRATING to GHL)
 * ✅ ghl-messaging - Unified SMS + Email + CRM
 * ✅ signatures - In-house SignatureCapture component (replaced DocuSeal/Documenso)
 * ✅ jobnimbus - Active (via GHL)
 * ⛔ wisetack - REMOVED — Enhancify TBD
 * ⛔ signalwire - DEPRECATED — using GHL
 *
 * Removed:
 * - Roofr (replaced by Google Solar API)
 * - Cal.com (not using external scheduling)
 */

// E-Signature: handled in-house via SignatureCapture component
// DocuSeal and Documenso adapters removed — signatures captured natively

// Financing (Enhancify TBD — stub only)
export { wisetackAdapter } from './wisetack';

// CRM
export {
  jobnimbusAdapter,
  type CreateContactRequest,
  type CreateJobRequest
} from './jobnimbus';

// Email
export {
  resendAdapter,
  type SendEmailRequest,
  type EmailTemplate
} from './resend';

// SMS (legacy - migrating to GHL)
export {
  signalwireAdapter,
  type SendSmsRequest
} from './signalwire';

// GoHighLevel Unified Messaging (SMS + Email + CRM)
export {
  ghlMessagingAdapter,
  type GHLSendSmsRequest,
  type GHLSendEmailRequest,
  type GHLMessageResponse,
} from './ghl-messaging';

// Satellite Roof Measurements (Google Solar API)
export {
  fetchSolarMeasurement,
  type SolarMeasurementResult,
  type SolarMeasurementError,
  type SolarMeasurementOutcome,
} from './google-solar';

// GAF QuickMeasure (Digital Design API)
export {
  gafAdapter,
  type GAFPlaceOrderInput,
  type GAFOrderResponse,
} from './gaf';

// Stripe Customer Management
export {
  getStripeClient,
  getOrCreateStripeCustomer,
} from './stripe';
