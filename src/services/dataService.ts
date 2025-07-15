// Abstract Data Service Interface

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

export abstract class DataService {
  // Contact operations
  abstract getContacts(): Promise<Contact[]>;
  abstract getContact(id: string): Promise<Contact>;
  abstract createContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact>;
  abstract updateContact(id: string, contact: Partial<Contact>): Promise<Contact>;
  abstract deleteContact(id: string): Promise<void>;

  // Property operations
  abstract getProperties(): Promise<Property[]>;
  abstract getProperty(id: string): Promise<Property>;
  abstract createProperty(property: Omit<Property, 'id' | 'lastUpdated'>): Promise<Property>;
  abstract updateProperty(id: string, property: Partial<Property>): Promise<Property>;
  abstract deleteProperty(id: string): Promise<void>;

  // Protest operations
  abstract getProtests(): Promise<Protest[]>;
  abstract getProtest(id: string): Promise<Protest>;
  abstract createProtest(protest: Omit<Protest, 'id'>): Promise<Protest>;
  abstract updateProtest(id: string, protest: Partial<Protest>): Promise<Protest>;
  abstract deleteProtest(id: string): Promise<void>;

  // Bill operations
  abstract getBills(): Promise<Bill[]>;
  abstract getBill(id: string): Promise<Bill>;
  abstract createBill(bill: Omit<Bill, 'id' | 'importDate'>): Promise<Bill>;
  abstract updateBill(id: string, bill: Partial<Bill>): Promise<Bill>;
  abstract deleteBill(id: string): Promise<void>;

  // Invoice operations
  abstract getInvoices(): Promise<Invoice[]>;
  abstract getInvoice(id: string): Promise<Invoice>;
  abstract createInvoice(invoice: Omit<Invoice, 'id' | 'createdDate'>): Promise<Invoice>;
  abstract updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice>;
  abstract deleteInvoice(id: string): Promise<void>;

  // Document operations
  abstract getDocuments(): Promise<Document[]>;
  abstract getDocument(id: string): Promise<Document>;
  abstract createDocument(document: Omit<Document, 'id' | 'createdDate'>): Promise<Document>;
  abstract updateDocument(id: string, document: Partial<Document>): Promise<Document>;
  abstract deleteDocument(id: string): Promise<void>;

  // Document Template operations
  abstract getDocumentTemplates(): Promise<DocumentTemplate[]>;
  abstract getDocumentTemplate(id: string): Promise<DocumentTemplate>;
  abstract createDocumentTemplate(template: Omit<DocumentTemplate, 'id'>): Promise<DocumentTemplate>;
  abstract updateDocumentTemplate(id: string, template: Partial<DocumentTemplate>): Promise<DocumentTemplate>;
  abstract deleteDocumentTemplate(id: string): Promise<void>;

  // Communication operations
  abstract getCommunications(): Promise<Communication[]>;
  abstract getCommunication(id: string): Promise<Communication>;
  abstract createCommunication(communication: Omit<Communication, 'id' | 'date'>): Promise<Communication>;
  abstract updateCommunication(id: string, communication: Partial<Communication>): Promise<Communication>;
  abstract deleteCommunication(id: string): Promise<void>;

  // Owner operations
  abstract getOwners(): Promise<Owner[]>;
  abstract getOwner(id: string): Promise<Owner>;
  abstract createOwner(owner: Omit<Owner, 'id' | 'createdAt'>): Promise<Owner>;
  abstract updateOwner(id: string, owner: Partial<Owner>): Promise<Owner>;
  abstract deleteOwner(id: string): Promise<void>;
}