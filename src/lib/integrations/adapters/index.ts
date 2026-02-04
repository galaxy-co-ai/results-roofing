/**
 * Integration Adapters
 * Centralized exports for external service adapters
 *
 * Status (Updated 2026-02-03):
 * ✅ calcom - Adapter complete, webhook handler complete
 * ✅ resend - Email delivery complete (MIGRATING to GHL)
 * ⚠️ documenso - STUB (awaiting client account)
 * ⚠️ wisetack - STUB → MIGRATING to Enhancify
 * ⚠️ roofr - STUB → MIGRATING to GAF QuickMeasure
 * ⚠️ jobnimbus - STUB (awaiting client API access)
 * ⚠️ signalwire - STUB → MIGRATING to GoHighLevel (GHL)
 *
 * Migration Notes:
 * - Roofr → GAF QuickMeasure (roof measurements)
 * - Wisetack → Enhancify (financing pre-qual)
 * - SignalWire + Resend → GoHighLevel (unified SMS + Email)
 */

// Scheduling
export { 
  calcomAdapter, 
  type TimeSlot, 
  type BookingRequest, 
  type BookingResponse 
} from './calcom';

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

// Measurement
export { 
  roofrAdapter, 
  type MeasurementRequest, 
  type MeasurementReport 
} from './roofr';

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
