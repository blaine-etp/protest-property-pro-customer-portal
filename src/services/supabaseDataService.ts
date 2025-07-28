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
          savings_amount,
          properties:property_id(
            situs_address
          )
        ),
        contacts:contact_id(
          id,
          first_name,
          last_name,
          email,
          phone
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
      contact: bill.contacts ? `${bill.contacts.first_name} ${bill.contacts.last_name}` : 'Unknown Contact',
      contactId: bill.contact_id || '',
      taxYear: bill.tax_year?.toString() || new Date().getFullYear().toString(),
      billNumber: bill.bill_number || `BILL-${bill.id.slice(-8)}`,
      assessedValue: bill.total_assessed_value ? `$${Number(bill.total_assessed_value).toLocaleString()}` : '$0',
      taxAmount: bill.total_protest_amount ? `$${Number(bill.total_protest_amount).toLocaleString()}` : '$0',
      taxSavings: bill.protests?.savings_amount ? `$${Number(bill.protests.savings_amount).toLocaleString()}` : '$0',
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
          savings_amount,
          properties:property_id(
            situs_address
          )
        ),
        contacts:contact_id(
          id,
          first_name,
          last_name,
          email,
          phone
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
      contact: billData.contacts ? `${billData.contacts.first_name} ${billData.contacts.last_name}` : 'Unknown Contact',
      contactId: billData.contact_id || '',
      taxYear: billData.tax_year?.toString() || new Date().getFullYear().toString(),
      billNumber: billData.bill_number || `BILL-${billData.id.slice(-8)}`,
      assessedValue: billData.total_assessed_value ? `$${Number(billData.total_assessed_value).toLocaleString()}` : '$0',
      taxAmount: billData.total_protest_amount ? `$${Number(billData.total_protest_amount).toLocaleString()}` : '$0',
      taxSavings: billData.protests?.savings_amount ? `$${Number(billData.protests.savings_amount).toLocaleString()}` : '$0',
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

  private formatDocumentType(type: string): string {
    switch (type) {
      case 'form-50-162':
        return 'Form 50-162';
      case 'evidence-package':
        return 'Evidence Package';
      case 'hearing-notice':
        return 'Hearing Notice';
      case 'settlement':
        return 'Settlement Agreement';
      default:
        return type;
    }
  }

  private mapDocumentStatus(status: string | null): Document['status'] {
    switch (status?.toLowerCase()) {
      case 'generated': return 'Generated';
      case 'draft': return 'Draft';
      case 'delivered': return 'Delivered';
      case 'signed': return 'Signed';
      default: return 'Generated';
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
    const { data: documentsData, error } = await supabase
      .from('customer_documents')
      .select(`
        *,
        owners(name),
        contacts(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    // Transform the data to match the Document interface
    return (documentsData || []).map(doc => {
      const contactName = (doc as any).contacts 
        ? `${(doc as any).contacts.first_name} ${(doc as any).contacts.last_name}`.trim()
        : 'Unknown Contact';

      return {
        id: doc.id,
        name: `${this.formatDocumentType(doc.document_type)}.pdf`,
        type: doc.document_type as Document['type'],
        owner: (doc as any).owners?.name || 'Unknown Owner',
        protest: 'Active', // Placeholder - would need to check protests table
        status: this.mapDocumentStatus(doc.status),
        createdDate: new Date(doc.created_at).toLocaleDateString(),
        size: '1.2 MB', // Placeholder - would need to get from storage
        downloadCount: 0 // Placeholder - would need tracking table
      };
    });
  }

  async getDocument(id: string): Promise<Document> {
    const { data: documentData, error } = await supabase
      .from('customer_documents')
      .select(`
        *,
        owners(name),
        contacts(first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching document:', error);
      throw new Error(`Failed to fetch document: ${error.message}`);
    }

    if (!documentData) {
      throw new Error('Document not found');
    }

    const contactName = (documentData as any).contacts 
      ? `${(documentData as any).contacts.first_name} ${(documentData as any).contacts.last_name}`.trim()
      : 'Unknown Contact';

    // Transform the data to match the Document interface
    return {
      id: documentData.id,
      name: `${this.formatDocumentType(documentData.document_type)}.pdf`,
      type: documentData.document_type as Document['type'],
      owner: (documentData as any).owners?.name || 'Unknown Owner',
      protest: 'Active', // Placeholder - would need to check protests table
      status: this.mapDocumentStatus(documentData.status),
      createdDate: new Date(documentData.created_at).toLocaleDateString(),
      size: '1.2 MB', // Placeholder - would need to get from storage
      downloadCount: 0 // Placeholder - would need tracking table
    };
  }

  async createDocument(document: Omit<Document, 'id' | 'createdDate'>): Promise<Document> {
    // This would require creating a customer document record
    throw new Error('Creating documents not yet implemented');
  }

  async updateDocument(id: string, document: Partial<Document>): Promise<Document> {
    // This would update the customer document record
    throw new Error('Updating documents not yet implemented');
  }

  async deleteDocument(id: string): Promise<void> {
    // This would delete the customer document record
    throw new Error('Deleting documents not yet implemented');
  }

  async getDocumentTemplates(): Promise<DocumentTemplate[]> {
    // Mock templates since we don't have a templates table yet
    return [
      {
        id: 'template-1',
        name: 'Form 50-162 Template',
        description: 'Standard property tax protest form',
        category: 'Legal Forms',
        lastUpdated: new Date().toLocaleDateString(),
        usage: 45
      },
      {
        id: 'template-2',
        name: 'Evidence Package Template',
        description: 'Template for evidence submission',
        category: 'Evidence',
        lastUpdated: new Date().toLocaleDateString(),
        usage: 23
      }
    ];
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