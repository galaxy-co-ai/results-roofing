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

// User Linking
export {
  linkQuotesToUser,
  getOrdersByUser,
  getPendingQuotesByUser,
} from './user-linking';

// Blog Posts
export {
  getPublishedPosts,
  getFeaturedPosts,
  getPostBySlug,
  getPostById,
  getRelatedPosts,
  listPosts,
  createPost,
  updatePost,
  deletePost,
  incrementViewCount,
} from './blog-posts';

// Materials
export {
  listMaterialOrders,
  getMaterialOrder,
  createMaterialOrder,
  updateMaterialOrder,
  deleteMaterialOrder,
} from './materials';

// Automations
export {
  listAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
} from './automations';

// Team Members
export {
  listTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from './team-members';

// Settings
export {
  getCompanySettings,
  upsertCompanySettings,
  listPipelineStages,
  createPipelineStage,
  updatePipelineStage,
  deletePipelineStage,
  reorderPipelineStages,
  listNotificationPreferences,
  updateNotificationPreference,
} from './settings';
