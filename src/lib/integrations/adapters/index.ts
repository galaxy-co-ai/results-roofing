/**
 * Integration Adapters
 * Centralized exports for external service adapters
 *
 * Status (Updated 2026-02-08):
 * ✅ google-solar - Satellite roof measurements via Google Solar API
 * ✅ resend - Email delivery complete (MIGRATING to GHL)
 * ✅ ghl-messaging - Unified SMS + Email + CRM
 * ✅ signatures - In-house SignatureCapture component (replaced DocuSeal/Documenso)
 * ⚠️ wisetack - STUB → MIGRATING to Enhancify
 * ⚠️ jobnimbus - STUB (awaiting client API access)
 * ⚠️ signalwire - STUB → MIGRATING to GoHighLevel (GHL)
 *
 * Removed:
 * - Roofr (replaced by Google Solar API)
 * - Cal.com (not using external scheduling)
 */

// E-Signature: handled in-house via SignatureCapture component
// DocuSeal and Documenso adapters removed — signatures captured natively

// Financing
export {
  wisetackAdapter,
  type PrequalRequest,
  type PrequalResponse
} from './wisetack';

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
