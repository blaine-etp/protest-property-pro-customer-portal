// Centralized Mock Data for CRM

import type {
  Contact,
  Property,
  Protest,
  Bill,
  Invoice,
  Document,
  DocumentTemplate,
  Communication,
  Owner
} from './types';

export const mockContacts: Contact[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "(512) 555-0101",
    status: "active",
    company: "Smith Real Estate",
    address: "123 Main Street",
    city: "Austin",
    state: "TX",
    zip: "78701",
    notes: "Primary contact for downtown properties",
    createdAt: "2024-01-15",
    lastActivity: "2024-01-20",
    propertiesCount: 3,
    totalSavings: 8500,
    source: "Website",
    assigned: "Jane Doe"
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(512) 555-0102",
    status: "active",
    company: null,
    address: "456 Oak Avenue",
    city: "Austin",
    state: "TX",
    zip: "78702",
    notes: "Interested in multiple property assessments",
    createdAt: "2024-01-14",
    lastActivity: "2024-01-19",
    propertiesCount: 1,
    totalSavings: 3200,
    source: "Referral",
    assigned: "Mike Wilson"
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@email.com",
    phone: "(512) 555-0103",
    status: "active",
    company: "Brown Holdings LLC",
    address: "789 Pine Street",
    city: "Austin",
    state: "TX",
    zip: "78703",
    notes: "Commercial property owner",
    createdAt: "2024-01-12",
    lastActivity: "2024-01-18",
    propertiesCount: 5,
    totalSavings: 15600,
    source: "LinkedIn",
    assigned: "Sarah Lee"
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@email.com",
    phone: "(512) 555-0104",
    status: "prospect",
    company: null,
    address: "321 Elm Drive",
    city: "Austin",
    state: "TX",
    zip: "78704",
    notes: "Considering property tax services",
    createdAt: "2024-01-10",
    lastActivity: "2024-01-17",
    propertiesCount: 2,
    totalSavings: 4200,
    source: "Cold Call",
    assigned: "Tom Garcia"
  }
];

export const mockProperties: Property[] = [
  {
    id: "1",
    etpPid: "ETP-TX-TRAV-001234",
    countyPid: "R123456789",
    address: "123 Main Street, Austin, TX 78701",
    parcelNumber: "012345678",
    assessedValue: "$450,000",
    marketValue: "$520,000",
    taxAmount: "$12,350",
    owner: "John Smith",
    status: "Active Protest",
    protestDeadline: "2024-02-15",
    potentialSavings: "$2,100",
    lastUpdated: "2024-01-15"
  },
  {
    id: "2",
    etpPid: "ETP-TX-TRAV-001235",
    countyPid: "R987654321",
    address: "456 Oak Avenue, Austin, TX 78702",
    parcelNumber: "987654321",
    assessedValue: "$325,000",
    marketValue: "$380,000",
    taxAmount: "$8,925",
    owner: "Sarah Johnson",
    status: "Review Needed",
    protestDeadline: "2024-02-20",
    potentialSavings: "$1,650",
    lastUpdated: "2024-01-14"
  },
  {
    id: "3",
    etpPid: "ETP-TX-TRAV-001236",
    countyPid: "R456789123",
    address: "789 Pine Street, Austin, TX 78703",
    parcelNumber: "456789123",
    assessedValue: "$675,000",
    marketValue: "$720,000",
    taxAmount: "$18,525",
    owner: "Michael Brown",
    status: "Completed",
    protestDeadline: "N/A",
    potentialSavings: "$3,200",
    lastUpdated: "2024-01-10"
  },
  {
    id: "4",
    etpPid: "ETP-TX-TRAV-001237",
    countyPid: "R789123456",
    address: "321 Elm Drive, Austin, TX 78704",
    parcelNumber: "789123456",
    assessedValue: "$280,000",
    marketValue: "$295,000",
    taxAmount: "$7,700",
    owner: "Emily Davis",
    status: "Monitoring",
    protestDeadline: "2024-03-01",
    potentialSavings: "$450",
    lastUpdated: "2024-01-12"
  }
];

export const mockProtests: Protest[] = [
  {
    id: "1",
    propertyAddress: "123 Main Street, Austin, TX",
    owner: "John Smith",
    status: "Filed",
    filedDate: "2024-01-10",
    hearingDate: "2024-02-15",
    assessedValue: "$450,000",
    targetValue: "$420,000",
    potentialSavings: "$2,100",
    agent: "Jane Doe",
    progress: 25
  },
  {
    id: "2",
    propertyAddress: "456 Oak Avenue, Austin, TX",
    owner: "Sarah Johnson",
    status: "Under Review",
    filedDate: "2024-01-15",
    hearingDate: "2024-02-20",
    assessedValue: "$325,000",
    targetValue: "$305,000",
    potentialSavings: "$1,650",
    agent: "Mike Wilson",
    progress: 60
  },
  {
    id: "3",
    propertyAddress: "789 Pine Street, Austin, TX",
    owner: "Michael Brown",
    status: "Approved",
    filedDate: "2023-12-05",
    hearingDate: "2024-01-10",
    assessedValue: "$675,000",
    targetValue: "$640,000",
    potentialSavings: "$3,200",
    agent: "Sarah Lee",
    progress: 100
  },
  {
    id: "4",
    propertyAddress: "321 Elm Drive, Austin, TX",
    owner: "Emily Davis",
    status: "Rejected",
    filedDate: "2023-11-20",
    hearingDate: "2023-12-15",
    assessedValue: "$280,000",
    targetValue: "$260,000",
    potentialSavings: "$0",
    agent: "Tom Garcia",
    progress: 100
  }
];

export const mockBills: Bill[] = [
  {
    id: "1",
    propertyAddress: "123 Main Street, Austin, TX",
    owner: "John Smith",
    taxYear: "2024",
    billNumber: "TAX-2024-001",
    assessedValue: "$450,000",
    taxAmount: "$12,350",
    dueDate: "2024-03-15",
    status: "Pending",
    paidAmount: "$0",
    importDate: "2024-01-15"
  },
  {
    id: "2",
    propertyAddress: "456 Oak Avenue, Austin, TX",
    owner: "Sarah Johnson",
    taxYear: "2024",
    billNumber: "TAX-2024-002",
    assessedValue: "$325,000",
    taxAmount: "$8,925",
    dueDate: "2024-03-20",
    status: "Under Review",
    paidAmount: "$0",
    importDate: "2024-01-14"
  },
  {
    id: "3",
    propertyAddress: "789 Pine Street, Austin, TX",
    owner: "Michael Brown",
    taxYear: "2023",
    billNumber: "TAX-2023-003",
    assessedValue: "$675,000",
    taxAmount: "$18,525",
    dueDate: "2023-12-15",
    status: "Protested",
    paidAmount: "$15,325",
    importDate: "2023-10-01"
  },
  {
    id: "4",
    propertyAddress: "321 Elm Drive, Austin, TX",
    owner: "Emily Davis",
    taxYear: "2023",
    billNumber: "TAX-2023-004",
    assessedValue: "$280,000",
    taxAmount: "$7,700",
    dueDate: "2023-12-20",
    status: "Paid",
    paidAmount: "$7,700",
    importDate: "2023-09-15"
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "1",
    billId: "TAX-2024-001",
    propertyAddress: "123 Main Street, Austin, TX",
    client: "John Smith",
    serviceType: "Property Tax Protest",
    amount: "$750",
    status: "Sent",
    dueDate: "2024-02-15",
    createdDate: "2024-01-15"
  },
  {
    id: "2",
    billId: "TAX-2024-002",
    propertyAddress: "456 Oak Avenue, Austin, TX",
    client: "Sarah Johnson",
    serviceType: "Assessment Review",
    amount: "$500",
    status: "Draft",
    dueDate: "2024-02-20",
    createdDate: "2024-01-14"
  },
  {
    id: "3",
    billId: "TAX-2023-003",
    propertyAddress: "789 Pine Street, Austin, TX",
    client: "Michael Brown",
    serviceType: "Appeal Representation",
    amount: "$1,200",
    status: "Paid",
    dueDate: "2024-01-10",
    createdDate: "2023-12-01"
  }
];

export const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Form 50-162 - Property Tax Protest",
    type: "form-50-162",
    property: "123 Main Street, Austin, TX",
    owner: "John Smith",
    protest: "PRT-001",
    status: "Generated",
    createdDate: "2024-01-15",
    size: "2.3 MB",
    downloadCount: 3
  },
  {
    id: "2",
    name: "Evidence Package - Market Analysis",
    type: "evidence-package",
    property: "456 Oak Avenue, Austin, TX",
    owner: "Sarah Johnson",
    protest: "PRT-002",
    status: "Draft",
    createdDate: "2024-01-14",
    size: "5.7 MB",
    downloadCount: 1
  },
  {
    id: "3",
    name: "Hearing Notice - County Appeal",
    type: "hearing-notice",
    property: "789 Pine Street, Austin, TX",
    owner: "Michael Brown",
    protest: "PRT-003",
    status: "Delivered",
    createdDate: "2024-01-12",
    size: "1.2 MB",
    downloadCount: 5
  },
  {
    id: "4",
    name: "Settlement Agreement",
    type: "settlement",
    property: "321 Elm Drive, Austin, TX",
    owner: "Emily Davis",
    protest: "PRT-004",
    status: "Signed",
    createdDate: "2024-01-10",
    size: "800 KB",
    downloadCount: 2
  }
];

export const mockDocumentTemplates: DocumentTemplate[] = [
  {
    id: "1",
    name: "Form 50-162 Template",
    description: "Standard property tax protest form",
    category: "Legal Forms",
    lastUpdated: "2024-01-01",
    usage: 45
  },
  {
    id: "2",
    name: "Evidence Package Template",
    description: "Market analysis and comparable properties",
    category: "Evidence",
    lastUpdated: "2023-12-15",
    usage: 32
  },
  {
    id: "3",
    name: "Hearing Notice Template",
    description: "County appeal board hearing notification",
    category: "Notifications",
    lastUpdated: "2023-12-10",
    usage: 28
  },
  {
    id: "4",
    name: "Settlement Agreement Template",
    description: "Standard settlement terms and conditions",
    category: "Legal Forms",
    lastUpdated: "2023-11-20",
    usage: 15
  }
];

export const mockCommunications: Communication[] = [
  {
    id: "1",
    contactId: "1",
    contactName: "John Smith",
    subject: "Property Assessment Review Meeting",
    type: "meeting",
    direction: "outbound",
    status: "completed",
    date: "2024-01-20",
    summary: "Discussed current assessment values and protest strategy for 3 properties.",
    followUpDate: "2024-02-05",
    priority: "high"
  },
  {
    id: "2",
    contactId: "2",
    contactName: "Sarah Johnson",
    subject: "Initial Consultation Call",
    type: "phone",
    direction: "inbound",
    status: "completed",
    date: "2024-01-19",
    summary: "Sarah called to inquire about property tax services for her Oak Avenue property.",
    followUpDate: null,
    priority: "medium"
  },
  {
    id: "3",
    contactId: "3",
    contactName: "Michael Brown",
    subject: "Commercial Property Strategy Email",
    type: "email",
    direction: "outbound",
    status: "completed",
    date: "2024-01-18",
    summary: "Sent detailed analysis of commercial property protest opportunities.",
    followUpDate: "2024-02-01",
    priority: "high"
  }
];

export const mockOwners: Owner[] = [
  {
    id: "1",
    name: "John Smith",
    type: "individual",
    contactInfo: {
      email: "john.smith@email.com",
      phone: "(512) 555-0101"
    },
    mailingAddress: {
      street: "123 Main Street",
      city: "Austin",
      state: "TX",
      zip: "78701"
    },
    taxId: "123-45-6789",
    notes: "Owns multiple downtown properties",
    propertiesCount: 3,
    totalAssessedValue: 1275000,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Brown Holdings LLC",
    type: "business",
    contactInfo: {
      email: "contact@brownholdings.com",
      phone: "(512) 555-0200"
    },
    mailingAddress: {
      street: "789 Pine Street",
      city: "Austin",
      state: "TX",
      zip: "78703"
    },
    taxId: "12-3456789",
    notes: "Commercial real estate investment company",
    propertiesCount: 8,
    totalAssessedValue: 4200000,
    createdAt: "2024-01-10"
  }
];