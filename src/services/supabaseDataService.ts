import { supabase } from '@/integrations/supabase/client';
import { DataService } from './dataService';
import type { Bill, Contact, Property, Protest, Invoice, Document, DocumentTemplate, Communication, Owner } from './types';

export class SupabaseDataService extends DataService {
  // Bill operations - implemented with real Supabase data
  async getBills(): Promise<Bill[]> {
    const { data: billsData, error } = await supabase
      .from('bills')
      .select(`
        *,
        protests:protest_id(
          id,
          situs_address,
          owner_name,
          assessed_value,
          properties:property_id(
            situs_address,
            owner_id
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bills:', error);
      throw new Error(`Failed to fetch bills: ${error.message}`);
    }

    // Transform the data to match the Bill interface
    return (billsData || []).map(bill => ({
      id: bill.id,
      protestId: bill.protest_id || '',
      propertyAddress: bill.protests?.situs_address || bill.protests?.properties?.situs_address || 'Unknown Address',
      owner: bill.protests?.owner_name || 'Unknown Owner',
      taxYear: bill.tax_year?.toString() || new Date().getFullYear().toString(),
      billNumber: bill.bill_number || `BILL-${bill.id.slice(-8)}`,
      assessedValue: bill.total_assessed_value ? `$${Number(bill.total_assessed_value).toLocaleString()}` : '$0',
      taxAmount: bill.total_protest_amount ? `$${Number(bill.total_protest_amount).toLocaleString()}` : '$0',
      dueDate: bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'TBD',
      status: this.mapBillStatus(bill.status),
      paidAmount: '$0', // Field doesn't exist in current schema
      importDate: bill.created_at ? new Date(bill.created_at).toLocaleDateString() : new Date().toLocaleDateString()
    }));
  }

  async getBill(id: string): Promise<Bill> {
    const { data: billData, error } = await supabase
      .from('bills')
      .select(`
        *,
        protests:protest_id(
          id,
          situs_address,
          owner_name,
          assessed_value,
          properties:property_id(
            situs_address,
            owner_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching bill:', error);
      throw new Error(`Failed to fetch bill: ${error.message}`);
    }

    // Transform the data to match the Bill interface
    return {
      id: billData.id,
      protestId: billData.protest_id || '',
      propertyAddress: billData.protests?.situs_address || billData.protests?.properties?.situs_address || 'Unknown Address',
      owner: billData.protests?.owner_name || 'Unknown Owner',
      taxYear: billData.tax_year?.toString() || new Date().getFullYear().toString(),
      billNumber: billData.bill_number || `BILL-${billData.id.slice(-8)}`,
      assessedValue: billData.total_assessed_value ? `$${Number(billData.total_assessed_value).toLocaleString()}` : '$0',
      taxAmount: billData.total_protest_amount ? `$${Number(billData.total_protest_amount).toLocaleString()}` : '$0',
      dueDate: billData.due_date ? new Date(billData.due_date).toLocaleDateString() : 'TBD',
      status: this.mapBillStatus(billData.status),
      paidAmount: '$0', // Field doesn't exist in current schema
      importDate: billData.created_at ? new Date(billData.created_at).toLocaleDateString() : new Date().toLocaleDateString()
    };
  }

  async createBill(bill: Omit<Bill, 'id' | 'importDate'>): Promise<Bill> {
    // Implementation would go here for creating bills
    throw new Error('Creating bills not yet implemented');
  }

  async updateBill(id: string, bill: Partial<Bill>): Promise<Bill> {
    // Implementation would go here for updating bills
    throw new Error('Updating bills not yet implemented');
  }

  async deleteBill(id: string): Promise<void> {
    // Implementation would go here for deleting bills
    throw new Error('Deleting bills not yet implemented');
  }

  private mapBillStatus(status: string | null): Bill['status'] {
    switch (status?.toLowerCase()) {
      case 'draft': return 'Draft';
      case 'pending': return 'Pending';
      case 'under_review': return 'Under Review';
      case 'protested': return 'Protested';
      case 'paid': return 'Paid';
      default: return 'Draft';
    }
  }

  // Placeholder implementations for other methods (using mock data for now)
  async getContacts(): Promise<Contact[]> {
    throw new Error('Method not implemented with real data yet');
  }

  async getContact(id: string): Promise<Contact> {
    throw new Error('Method not implemented with real data yet');
  }

  async createContact(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    throw new Error('Method not implemented with real data yet');
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    throw new Error('Method not implemented with real data yet');
  }

  async deleteContact(id: string): Promise<void> {
    throw new Error('Method not implemented with real data yet');
  }

  async getProperties(): Promise<Property[]> {
    throw new Error('Method not implemented with real data yet');
  }

  async getProperty(id: string): Promise<Property> {
    throw new Error('Method not implemented with real data yet');
  }

  async createProperty(property: Omit<Property, 'id' | 'lastUpdated'>): Promise<Property> {
    throw new Error('Method not implemented with real data yet');
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    throw new Error('Method not implemented with real data yet');
  }

  async deleteProperty(id: string): Promise<void> {
    throw new Error('Method not implemented with real data yet');
  }

  async getProtests(): Promise<Protest[]> {
    throw new Error('Method not implemented with real data yet');
  }

  async getProtest(id: string): Promise<Protest> {
    throw new Error('Method not implemented with real data yet');
  }

  async createProtest(protest: Omit<Protest, 'id'>): Promise<Protest> {
    throw new Error('Method not implemented with real data yet');
  }

  async updateProtest(id: string, protest: Partial<Protest>): Promise<Protest> {
    throw new Error('Method not implemented with real data yet');
  }

  async deleteProtest(id: string): Promise<void> {
    throw new Error('Method not implemented with real data yet');
  }

  async getInvoices(): Promise<Invoice[]> {
    throw new Error('Method not implemented with real data yet');
  }

  async getInvoice(id: string): Promise<Invoice> {
    throw new Error('Method not implemented with real data yet');
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdDate'>): Promise<Invoice> {
    throw new Error('Method not implemented with real data yet');
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    throw new Error('Method not implemented with real data yet');
  }

  async deleteInvoice(id: string): Promise<void> {
    throw new Error('Method not implemented with real data yet');
  }

  async getDocuments(): Promise<Document[]> {
    throw new Error('Method not implemented with real data yet');
  }

  async getDocument(id: string): Promise<Document> {
    throw new Error('Method not implemented with real data yet');
  }

  async createDocument(document: Omit<Document, 'id' | 'createdDate'>): Promise<Document> {
    throw new Error('Method not implemented with real data yet');
  }

  async updateDocument(id: string, document: Partial<Document>): Promise<Document> {
    throw new Error('Method not implemented with real data yet');
  }

  async deleteDocument(id: string): Promise<void> {
    throw new Error('Method not implemented with real data yet');
  }

  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    throw new Error('Method not implemented with real data yet');
  }

  async getDocumentTemplate(id: string): Promise<DocumentTemplate> {
    throw new Error('Method not implemented with real data yet');
  }

  async createDocumentTemplate(template: Omit<DocumentTemplate, 'id'>): Promise<DocumentTemplate> {
    throw new Error('Method not implemented with real data yet');
  }

  async updateDocumentTemplate(id: string, template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    throw new Error('Method not implemented with real data yet');
  }

  async deleteDocumentTemplate(id: string): Promise<void> {
    throw new Error('Method not implemented with real data yet');
  }

  async getCommunications(): Promise<Communication[]> {
    throw new Error('Method not implemented with real data yet');
  }

  async getCommunication(id: string): Promise<Communication> {
    throw new Error('Method not implemented with real data yet');
  }

  async createCommunication(communication: Omit<Communication, 'id' | 'date'>): Promise<Communication> {
    throw new Error('Method not implemented with real data yet');
  }

  async updateCommunication(id: string, communication: Partial<Communication>): Promise<Communication> {
    throw new Error('Method not implemented with real data yet');
  }

  async deleteCommunication(id: string): Promise<void> {
    throw new Error('Method not implemented with real data yet');
  }

  async getOwners(): Promise<Owner[]> {
    throw new Error('Method not implemented with real data yet');
  }

  async getOwner(id: string): Promise<Owner> {
    throw new Error('Method not implemented with real data yet');
  }

  async createOwner(owner: Omit<Owner, 'id' | 'createdAt'>): Promise<Owner> {
    throw new Error('Method not implemented with real data yet');
  }

  async updateOwner(id: string, owner: Partial<Owner>): Promise<Owner> {
    throw new Error('Method not implemented with real data yet');
  }

  async deleteOwner(id: string): Promise<void> {
    throw new Error('Method not implemented with real data yet');
  }
}