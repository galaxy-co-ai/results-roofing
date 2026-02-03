/**
 * GoHighLevel Integration
 * Unified CRM, SMS, Email, and Pipeline management
 */

// Client
export { createGHLClient, getGHLClient, GHLClientError, ghlRateLimiter } from './client';
export type { GHLClientConfig, GHLRequestOptions, GHLResponse, GHLError } from './client';

// Contacts API
export {
  listContacts,
  getContact,
  searchContacts,
  createContact,
  updateContact,
  deleteContact,
  addContactTags,
  removeContactTag,
  lookupContact,
  upsertContact,
} from './api/contacts';
export type {
  GHLContact,
  CreateContactInput,
  UpdateContactInput,
  ContactSearchParams,
  ContactsListResponse,
} from './api/contacts';

// Conversations API (SMS/Email)
export {
  listConversations,
  getConversation,
  searchConversations,
  getConversationMessages,
  sendMessage,
  sendSMS,
  sendEmail,
  markConversationRead,
  markConversationUnread,
  toggleConversationStar,
  deleteConversation,
  getOrCreateConversation,
  uploadAttachment,
} from './api/conversations';
export type {
  GHLConversation,
  GHLMessage,
  SendMessageInput,
  ConversationSearchParams,
  MessagesListParams,
  ConversationsListResponse,
  MessagesListResponse,
  MessageType,
  MessageStatus,
  MessageDirection,
} from './api/conversations';

// Pipelines API
export {
  listPipelines,
  getPipeline,
  listOpportunities,
  getOpportunity,
  searchOpportunities,
  createOpportunity,
  updateOpportunity,
  moveOpportunityToStage,
  updateOpportunityStatus,
  deleteOpportunity,
  getContactOpportunities,
  getStageOpportunities,
  getPipelineWithCounts,
} from './api/pipelines';
export type {
  GHLPipeline,
  GHLPipelineStage,
  GHLOpportunity,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunitySearchParams,
  OpportunitiesListResponse,
  PipelinesListResponse,
  OpportunityStatus,
  OpportunitySource,
} from './api/pipelines';
