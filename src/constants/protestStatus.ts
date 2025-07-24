// Shared protest status constants to ensure consistency across the application

export const PROTEST_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress', 
  OFFER_RECEIVED: 'offer_received',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  NEEDS_REVIEW: 'needs_review'
} as const;

export type ProtestStatus = typeof PROTEST_STATUSES[keyof typeof PROTEST_STATUSES];

export const PROTEST_STATUS_LABELS: Record<ProtestStatus, string> = {
  [PROTEST_STATUSES.PENDING]: 'Pending',
  [PROTEST_STATUSES.IN_PROGRESS]: 'In Progress',
  [PROTEST_STATUSES.OFFER_RECEIVED]: 'Offer Received',
  [PROTEST_STATUSES.ACCEPTED]: 'Accepted',
  [PROTEST_STATUSES.REJECTED]: 'Rejected',
  [PROTEST_STATUSES.COMPLETED]: 'Completed',
  [PROTEST_STATUSES.NEEDS_REVIEW]: 'Needs Review'
};

export const PROTEST_STATUS_COLORS: Record<ProtestStatus, string> = {
  [PROTEST_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PROTEST_STATUSES.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [PROTEST_STATUSES.OFFER_RECEIVED]: 'bg-purple-100 text-purple-800',
  [PROTEST_STATUSES.ACCEPTED]: 'bg-green-100 text-green-800',
  [PROTEST_STATUSES.REJECTED]: 'bg-red-100 text-red-800',
  [PROTEST_STATUSES.COMPLETED]: 'bg-gray-100 text-gray-800',
  [PROTEST_STATUSES.NEEDS_REVIEW]: 'bg-orange-100 text-orange-800'
};

// Icon mappings for status display
export const getProtestStatusIcon = (status: ProtestStatus) => {
  switch (status) {
    case PROTEST_STATUSES.PENDING:
      return 'Clock';
    case PROTEST_STATUSES.IN_PROGRESS:
      return 'FileText';
    case PROTEST_STATUSES.OFFER_RECEIVED:
      return 'Mail';
    case PROTEST_STATUSES.ACCEPTED:
      return 'CheckCircle';
    case PROTEST_STATUSES.REJECTED:
      return 'XCircle';
    case PROTEST_STATUSES.COMPLETED:
      return 'Check';
    case PROTEST_STATUSES.NEEDS_REVIEW:
      return 'AlertCircle';
    default:
      return 'Clock';
  }
};

// Legacy status mapping for backward compatibility
export const LEGACY_STATUS_MAPPING: Record<string, ProtestStatus> = {
  // AdminEvidence legacy statuses
  'waiting_for_offer': PROTEST_STATUSES.PENDING,
  'offer_received': PROTEST_STATUSES.OFFER_RECEIVED,
  'needs_review': PROTEST_STATUSES.NEEDS_REVIEW,
  'accepted': PROTEST_STATUSES.ACCEPTED,
  'rejected': PROTEST_STATUSES.REJECTED,
  'email_reply_required': PROTEST_STATUSES.NEEDS_REVIEW,
  
  // ProtestSection legacy statuses
  'pending': PROTEST_STATUSES.PENDING,
  'filed': PROTEST_STATUSES.IN_PROGRESS,
  
  // Common statuses already match
  'completed': PROTEST_STATUSES.COMPLETED,
  'in_progress': PROTEST_STATUSES.IN_PROGRESS
};