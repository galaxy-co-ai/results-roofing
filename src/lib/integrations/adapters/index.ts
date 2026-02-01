/**
 * Integration Adapters
 * Centralized exports for external service adapters
 *
 * Status:
 * ✅ calcom - Adapter complete, webhook handler complete
 * ✅ resend - Email delivery complete with templates
 * ⚠️ documenso - STUB (awaiting client account)
 * ⚠️ wisetack - STUB (awaiting client merchant account)
 * ⚠️ roofr - STUB (awaiting client API credentials)
 * ⚠️ jobnimbus - STUB (awaiting client API access)
 * ⚠️ signalwire - STUB (awaiting client account)
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

// SMS
export { 
  signalwireAdapter, 
  type SendSmsRequest 
} from './signalwire';
