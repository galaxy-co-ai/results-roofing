/**
 * Database Query Functions
 * Centralized exports for all database queries
 */

// Quotes
export {
  getQuote,
  getQuoteWithLead,
  getQuotesByLead,
  updateQuoteStatus,
  selectQuoteTier,
} from './quotes';

// Orders
export {
  getOrder,
  getOrdersByEmail,
  getOrderWithQuote,
  updateOrderStatus,
  getPaymentsByOrderId,
  getAppointmentsByOrderId,
  getContractsByOrderId,
} from './orders';

// Payments
export {
  getPaymentsByOrder,
  getPayment,
  getPaymentByStripeIntent,
  createPayment,
  updatePaymentStatus,
  getTotalPaidForOrder,
} from './payments';
