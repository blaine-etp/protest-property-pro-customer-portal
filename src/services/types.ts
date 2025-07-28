// CRM Entity Type Definitions

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: 'active' | 'inactive' | 'lead' | 'prospect';
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  createdAt: string;
  lastActivity: string;
  propertiesCount: number;
  totalSavings: number;
  source: string;
  assigned: string;
}

export interface Property {
  id: string;
  address: string; // Keep for backward compatibility in CRM
  situs_address?: string; // New field for database
  parcelNumber: string;
  etpPid?: string;
  countyPid?: string;
  propertyId: string;
  assessedValue: string;
  marketValue: string;
  taxAmount: string;
  owner: string;
  ownerId?: string;
  contactId?: string;
  protestId?: string;
  protestStatus?: 'filed' | 'settled' | 'none';
  documentId?: string;
  status: 'Active Protest' | 'Review Needed' | 'Completed' | 'Monitoring';
  protestDeadline: string;
  potentialSavings: string;
  lastUpdated: string;
}

export interface Protest {
  id: string;
  propertyAddress: string;
  owner: string;
  status: 'Filed' | 'Hearing Date Scheduled' | 'Settled';
  filedDate: string;
  hearingDate: string;
  assessedValue: string;
  targetValue: string;
  potentialSavings: string;
  agent: string;
  progress: number;
  protestYear: number;
  county: string;
  contactId: string;
}

export interface Bill {
  id: string;
  protestId: string;
  propertyAddress: string;
  contact: string; // Changed from owner to contact
  contactId: string;
  taxYear: string;
  billNumber: string;
  assessedValue: string;
  taxAmount: string;
  taxSavings: string; // New field
  dueDate: string;
  status: 'Draft' | 'Pending' | 'Under Review' | 'Protested' | 'Paid';
  paidAmount: string;
  importDate: string;
}

export interface Invoice {
  id: string;
  billId: string;
  propertyAddress: string;
  client: string;
  serviceType: string;
  amount: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dueDate: string;
  createdDate: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'form-50-162' | 'evidence-package' | 'hearing-notice' | 'settlement';
  owner: string;
  protest: string;
  status: 'Generated' | 'Draft' | 'Delivered' | 'Signed';
  createdDate: string;
  size: string;
  downloadCount: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Legal Forms' | 'Evidence' | 'Notifications';
  lastUpdated: string;
  usage: number;
}

export interface Communication {
  id: string;
  contactId: string;
  contactName: string;
  subject: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'scheduled' | 'cancelled';
  date: string;
  summary: string;
  followUpDate: string | null;
  priority: 'high' | 'medium' | 'low';
}

export interface Owner {
  id: string;
  name: string;
  type: 'individual' | 'business' | 'trust';
  contactInfo: {
    email?: string;
    phone?: string;
  };
  mailingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  taxId?: string;
  notes?: string;
  propertiesCount: number;
  totalAssessedValue: number;
  createdAt: string;
}