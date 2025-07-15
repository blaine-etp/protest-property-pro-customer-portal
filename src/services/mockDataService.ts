// Mock Data Service Implementation

import { DataService } from './dataService';
import {
  mockContacts,
  mockProperties,
  mockProtests,
  mockBills,
  mockInvoices,
  mockDocuments,
  mockDocumentTemplates,
  mockCommunications,
  mockOwners
} from './mockData';
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

export class MockDataService extends DataService {
  private delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    await this.delay();
    return [...mockContacts];
  }

  async getContact(id: string): Promise<Contact> {
    await this.delay();
    const contact = mockContacts.find(c => c.id === id);
    if (!contact) throw new Error(`Contact with id ${id} not found`);
    return contact;
  }

  async createContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    await this.delay();
    const newContact: Contact = {
      ...contact,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0]
    };
    mockContacts.push(newContact);
    return newContact;
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    await this.delay();
    const index = mockContacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Contact with id ${id} not found`);
    mockContacts[index] = { ...mockContacts[index], ...contact };
    return mockContacts[index];
  }

  async deleteContact(id: string): Promise<void> {
    await this.delay();
    const index = mockContacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Contact with id ${id} not found`);
    mockContacts.splice(index, 1);
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    await this.delay();
    return [...mockProperties];
  }

  async getProperty(id: string): Promise<Property> {
    await this.delay();
    const property = mockProperties.find(p => p.id === id);
    if (!property) throw new Error(`Property with id ${id} not found`);
    return property;
  }

  async createProperty(property: Omit<Property, 'id' | 'lastUpdated'>): Promise<Property> {
    await this.delay();
    const newProperty: Property = {
      ...property,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    mockProperties.push(newProperty);
    return newProperty;
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    await this.delay();
    const index = mockProperties.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Property with id ${id} not found`);
    mockProperties[index] = { 
      ...mockProperties[index], 
      ...property,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    return mockProperties[index];
  }

  async deleteProperty(id: string): Promise<void> {
    await this.delay();
    const index = mockProperties.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Property with id ${id} not found`);
    mockProperties.splice(index, 1);
  }

  // Protest operations
  async getProtests(): Promise<Protest[]> {
    await this.delay();
    return [...mockProtests];
  }

  async getProtest(id: string): Promise<Protest> {
    await this.delay();
    const protest = mockProtests.find(p => p.id === id);
    if (!protest) throw new Error(`Protest with id ${id} not found`);
    return protest;
  }

  async createProtest(protest: Omit<Protest, 'id'>): Promise<Protest> {
    await this.delay();
    const newProtest: Protest = {
      ...protest,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockProtests.push(newProtest);
    return newProtest;
  }

  async updateProtest(id: string, protest: Partial<Protest>): Promise<Protest> {
    await this.delay();
    const index = mockProtests.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Protest with id ${id} not found`);
    mockProtests[index] = { ...mockProtests[index], ...protest };
    return mockProtests[index];
  }

  async deleteProtest(id: string): Promise<void> {
    await this.delay();
    const index = mockProtests.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Protest with id ${id} not found`);
    mockProtests.splice(index, 1);
  }

  // Bill operations
  async getBills(): Promise<Bill[]> {
    await this.delay();
    return [...mockBills];
  }

  async getBill(id: string): Promise<Bill> {
    await this.delay();
    const bill = mockBills.find(b => b.id === id);
    if (!bill) throw new Error(`Bill with id ${id} not found`);
    return bill;
  }

  async createBill(bill: Omit<Bill, 'id' | 'importDate'>): Promise<Bill> {
    await this.delay();
    const newBill: Bill = {
      ...bill,
      id: Math.random().toString(36).substr(2, 9),
      importDate: new Date().toISOString().split('T')[0]
    };
    mockBills.push(newBill);
    return newBill;
  }

  async updateBill(id: string, bill: Partial<Bill>): Promise<Bill> {
    await this.delay();
    const index = mockBills.findIndex(b => b.id === id);
    if (index === -1) throw new Error(`Bill with id ${id} not found`);
    mockBills[index] = { ...mockBills[index], ...bill };
    return mockBills[index];
  }

  async deleteBill(id: string): Promise<void> {
    await this.delay();
    const index = mockBills.findIndex(b => b.id === id);
    if (index === -1) throw new Error(`Bill with id ${id} not found`);
    mockBills.splice(index, 1);
  }

  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    await this.delay();
    return [...mockInvoices];
  }

  async getInvoice(id: string): Promise<Invoice> {
    await this.delay();
    const invoice = mockInvoices.find(i => i.id === id);
    if (!invoice) throw new Error(`Invoice with id ${id} not found`);
    return invoice;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdDate'>): Promise<Invoice> {
    await this.delay();
    const newInvoice: Invoice = {
      ...invoice,
      id: Math.random().toString(36).substr(2, 9),
      createdDate: new Date().toISOString().split('T')[0]
    };
    mockInvoices.push(newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    await this.delay();
    const index = mockInvoices.findIndex(i => i.id === id);
    if (index === -1) throw new Error(`Invoice with id ${id} not found`);
    mockInvoices[index] = { ...mockInvoices[index], ...invoice };
    return mockInvoices[index];
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.delay();
    const index = mockInvoices.findIndex(i => i.id === id);
    if (index === -1) throw new Error(`Invoice with id ${id} not found`);
    mockInvoices.splice(index, 1);
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    await this.delay();
    return [...mockDocuments];
  }

  async getDocument(id: string): Promise<Document> {
    await this.delay();
    const document = mockDocuments.find(d => d.id === id);
    if (!document) throw new Error(`Document with id ${id} not found`);
    return document;
  }

  async createDocument(document: Omit<Document, 'id' | 'createdDate'>): Promise<Document> {
    await this.delay();
    const newDocument: Document = {
      ...document,
      id: Math.random().toString(36).substr(2, 9),
      createdDate: new Date().toISOString().split('T')[0]
    };
    mockDocuments.push(newDocument);
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<Document>): Promise<Document> {
    await this.delay();
    const index = mockDocuments.findIndex(d => d.id === id);
    if (index === -1) throw new Error(`Document with id ${id} not found`);
    mockDocuments[index] = { ...mockDocuments[index], ...document };
    return mockDocuments[index];
  }

  async deleteDocument(id: string): Promise<void> {
    await this.delay();
    const index = mockDocuments.findIndex(d => d.id === id);
    if (index === -1) throw new Error(`Document with id ${id} not found`);
    mockDocuments.splice(index, 1);
  }

  // Document Template operations
  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    await this.delay();
    return [...mockDocumentTemplates];
  }

  async getDocumentTemplate(id: string): Promise<DocumentTemplate> {
    await this.delay();
    const template = mockDocumentTemplates.find(t => t.id === id);
    if (!template) throw new Error(`Document template with id ${id} not found`);
    return template;
  }

  async createDocumentTemplate(template: Omit<DocumentTemplate, 'id'>): Promise<DocumentTemplate> {
    await this.delay();
    const newTemplate: DocumentTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockDocumentTemplates.push(newTemplate);
    return newTemplate;
  }

  async updateDocumentTemplate(id: string, template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    await this.delay();
    const index = mockDocumentTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Document template with id ${id} not found`);
    mockDocumentTemplates[index] = { ...mockDocumentTemplates[index], ...template };
    return mockDocumentTemplates[index];
  }

  async deleteDocumentTemplate(id: string): Promise<void> {
    await this.delay();
    const index = mockDocumentTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Document template with id ${id} not found`);
    mockDocumentTemplates.splice(index, 1);
  }

  // Communication operations
  async getCommunications(): Promise<Communication[]> {
    await this.delay();
    return [...mockCommunications];
  }

  async getCommunication(id: string): Promise<Communication> {
    await this.delay();
    const communication = mockCommunications.find(c => c.id === id);
    if (!communication) throw new Error(`Communication with id ${id} not found`);
    return communication;
  }

  async createCommunication(communication: Omit<Communication, 'id' | 'date'>): Promise<Communication> {
    await this.delay();
    const newCommunication: Communication = {
      ...communication,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0]
    };
    mockCommunications.push(newCommunication);
    return newCommunication;
  }

  async updateCommunication(id: string, communication: Partial<Communication>): Promise<Communication> {
    await this.delay();
    const index = mockCommunications.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Communication with id ${id} not found`);
    mockCommunications[index] = { ...mockCommunications[index], ...communication };
    return mockCommunications[index];
  }

  async deleteCommunication(id: string): Promise<void> {
    await this.delay();
    const index = mockCommunications.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Communication with id ${id} not found`);
    mockCommunications.splice(index, 1);
  }

  // Owner operations
  async getOwners(): Promise<Owner[]> {
    await this.delay();
    return [...mockOwners];
  }

  async getOwner(id: string): Promise<Owner> {
    await this.delay();
    const owner = mockOwners.find(o => o.id === id);
    if (!owner) throw new Error(`Owner with id ${id} not found`);
    return owner;
  }

  async createOwner(owner: Omit<Owner, 'id' | 'createdAt'>): Promise<Owner> {
    await this.delay();
    const newOwner: Owner = {
      ...owner,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0]
    };
    mockOwners.push(newOwner);
    return newOwner;
  }

  async updateOwner(id: string, owner: Partial<Owner>): Promise<Owner> {
    await this.delay();
    const index = mockOwners.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Owner with id ${id} not found`);
    mockOwners[index] = { ...mockOwners[index], ...owner };
    return mockOwners[index];
  }

  async deleteOwner(id: string): Promise<void> {
    await this.delay();
    const index = mockOwners.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Owner with id ${id} not found`);
    mockOwners.splice(index, 1);
  }
}