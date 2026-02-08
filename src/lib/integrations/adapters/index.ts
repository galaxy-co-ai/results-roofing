/**
 * Integration Adapters
 * Centralized exports for external service adapters
 *
 * Status (Updated 2026-02-08):
 * ✅ google-solar - Satellite roof measurements via Google Solar API
 * ✅ resend - Email delivery complete (MIGRATING to GHL)
 * ✅ ghl-messaging - Unified SMS + Email + CRM
 * ⚠️ documenso - STUB (awaiting client account)
 * ⚠️ wisetack - STUB → MIGRATING to Enhancify
 * ⚠️ jobnimbus - STUB (awaiting client API access)
 * ⚠️ signalwire - STUB → MIGRATING to GoHighLevel (GHL)
 *
 * Removed:
 * - Roofr (replaced by Google Solar API)
 * - Cal.com (not using external scheduling)
 */

// E-Signature
export {
  documensoAdapter,
  type CreateDocumentRequest,
  type DocumentResponse
} from './documenso';

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
