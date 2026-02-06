/**
 * Analytics Event Definitions
 * Defines the event taxonomy for the quote funnel
 */

/**
 * Standard event parameters included with all events
 */
export interface BaseEventParams {
  /** Unique session identifier */
  sessionId?: string;
  /** Page URL where event occurred */
  pageUrl?: string;
  /** Timestamp of the event */
  timestamp?: number;
  /** User ID if authenticated */
  userId?: string;
}

/**
 * Quote funnel event names
 */
export type QuoteFunnelEvent =
  | 'quote_started'
  | 'address_entered'
  | 'measurement_requested'
  | 'measurement_completed'
  | 'measurement_timeout'
  | 'measurement_manual_entry'
  | 'package_viewed'
  | 'package_selected'
  | 'financing_started'
  | 'financing_completed'
  | 'financing_declined'
  | 'appointment_viewed'
  | 'appointment_booked'
  | 'contract_viewed'
  | 'contract_signed'
  | 'payment_started'
  | 'deposit_paid'
  | 'confirmation_viewed';

/**
 * Portal event names
 */
export type PortalEvent =
  | 'portal_login'
  | 'portal_dashboard_viewed'
  | 'portal_documents_viewed'
  | 'portal_payments_viewed'
  | 'portal_schedule_viewed'
  | 'portal_document_downloaded';

/**
 * General website event names
 */
export type GeneralEvent =
  | 'page_view'
  | 'cta_clicked'
  | 'form_started'
  | 'form_completed'
  | 'error_occurred';

/**
 * All event names
 */
export type AnalyticsEventName = QuoteFunnelEvent | PortalEvent | GeneralEvent;

/**
 * Quote Started event
 */
export interface QuoteStartedParams extends BaseEventParams {
  /** Source of the quote (e.g., 'homepage', 'landing_page') */
  source?: string;
  /** UTM campaign if present */
  utmCampaign?: string;
  /** UTM source if present */
  utmSource?: string;
  /** UTM medium if present */
  utmMedium?: string;
}

/**
 * Address Entered event
 */
export interface AddressEnteredParams extends BaseEventParams {
  quoteId: string;
  state: string;
  city: string;
}

/**
 * Measurement events
 */
export interface MeasurementParams extends BaseEventParams {
  quoteId: string;
  /** Duration of measurement in milliseconds */
  durationMs?: number;
  /** Source: 'satellite' or 'manual' */
  source?: 'satellite' | 'manual';
}

/**
 * Package Selected event
 */
export interface PackageSelectedParams extends BaseEventParams {
  quoteId: string;
  tier: 'good' | 'better' | 'best';
  totalPrice: number;
  depositAmount: number;
  sqft?: number;
}

/**
 * Financing events
 */
export interface FinancingParams extends BaseEventParams {
  quoteId: string;
  provider?: 'wisetack' | 'hearth';
  termMonths?: number;
  monthlyPayment?: number;
}

/**
 * Appointment Booked event
 */
export interface AppointmentBookedParams extends BaseEventParams {
  quoteId: string;
  appointmentDate: string;
  appointmentType?: 'installation' | 'inspection';
}

/**
 * Contract Signed event
 */
export interface ContractSignedParams extends BaseEventParams {
  quoteId: string;
  contractId: string;
}

/**
 * Deposit Paid event (conversion)
 */
export interface DepositPaidParams extends BaseEventParams {
  quoteId: string;
  orderId: string;
  confirmationNumber: string;
  depositAmount: number;
  totalPrice: number;
  tier: 'good' | 'better' | 'best';
  /** Standard e-commerce conversion value */
  value: number;
  currency: string;
}

/**
 * Page View event
 */
export interface PageViewParams extends BaseEventParams {
  pagePath: string;
  pageTitle: string;
  referrer?: string;
}

/**
 * CTA Clicked event
 */
export interface CtaClickedParams extends BaseEventParams {
  ctaId: string;
  ctaText: string;
  ctaLocation: string;
}

/**
 * Error event
 */
export interface ErrorParams extends BaseEventParams {
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  componentName?: string;
}

/**
 * Event parameter types mapped by event name
 */
export type EventParamsMap = {
  quote_started: QuoteStartedParams;
  address_entered: AddressEnteredParams;
  measurement_requested: MeasurementParams;
  measurement_completed: MeasurementParams;
  measurement_timeout: MeasurementParams;
  measurement_manual_entry: MeasurementParams;
  package_viewed: BaseEventParams & { quoteId: string };
  package_selected: PackageSelectedParams;
  financing_started: FinancingParams;
  financing_completed: FinancingParams;
  financing_declined: FinancingParams;
  appointment_viewed: BaseEventParams & { quoteId: string };
  appointment_booked: AppointmentBookedParams;
  contract_viewed: BaseEventParams & { quoteId: string };
  contract_signed: ContractSignedParams;
  payment_started: BaseEventParams & { quoteId: string };
  deposit_paid: DepositPaidParams;
  confirmation_viewed: BaseEventParams & { quoteId: string; orderId: string };
  portal_login: BaseEventParams;
  portal_dashboard_viewed: BaseEventParams & { orderId?: string };
  portal_documents_viewed: BaseEventParams & { orderId?: string };
  portal_payments_viewed: BaseEventParams & { orderId?: string };
  portal_schedule_viewed: BaseEventParams & { orderId?: string };
  portal_document_downloaded: BaseEventParams & { documentType: string };
  page_view: PageViewParams;
  cta_clicked: CtaClickedParams;
  form_started: BaseEventParams & { formId: string };
  form_completed: BaseEventParams & { formId: string };
  error_occurred: ErrorParams;
};

/**
 * Full event structure for sending to analytics
 */
export interface AnalyticsEvent<T extends AnalyticsEventName = AnalyticsEventName> {
  name: T;
  params: T extends keyof EventParamsMap ? EventParamsMap[T] : BaseEventParams;
}
