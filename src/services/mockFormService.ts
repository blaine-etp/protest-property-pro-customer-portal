// Mock Form Submission Service
// Replaces all form submission and database operations with localStorage simulation

import { FormData } from '@/components/MultiStepForm';
import { mockAuthService } from './mockAuthService';

interface MockProperty {
  id: string;
  user_id: string;
  owner_id: string;
  address: string;
  parcel_number?: string;
  estimated_savings?: number;
  include_all_properties?: boolean;
  appeal_status?: {
    appeal_status: string;
    exemption_status: string;
    auto_appeal_enabled: boolean;
    savings_amount: number;
  };
}

interface MockOwner {
  id: string;
  name: string;
  owner_type: string;
  created_by_user_id: string;
  entity_relationship?: string;
  form_entity_name?: string;
  form_entity_type?: string;
  notes?: string;
}

interface MockApplication {
  id: string;
  user_id: string;
  property_id: string;
  signature: string;
  is_owner_verified: boolean;
  status: string;
}

interface MockSubmissionResult {
  success: boolean;
  profileId?: string;
  propertyId?: string;
  error?: string;
  redirectTo?: string;
}

class MockFormService {
  private readonly MOCK_PROPERTIES_KEY = 'mock_form_properties';
  private readonly MOCK_OWNERS_KEY = 'mock_form_owners';
  private readonly MOCK_APPLICATIONS_KEY = 'mock_form_applications';
  private readonly MOCK_EMAILS_KEY = 'mock_form_emails';

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with some sample data if none exists
    const existingProperties = this.getMockProperties();
    
    // Check if we need to update to UUID format
    const hasOldFormat = existingProperties.some(p => p.user_id && !p.user_id.includes('-'));
    if (hasOldFormat) {
      console.log('🔍 Clearing old format property data...');
      localStorage.removeItem(this.MOCK_PROPERTIES_KEY);
      localStorage.removeItem(this.MOCK_OWNERS_KEY);
    }
    
    const properties = this.getMockProperties();
    if (properties.length === 0) {
      const sampleProperties: MockProperty[] = [
        {
          id: 'prop-1',
          user_id: '550e8400-e29b-41d4-a716-446655440001', // UUID format matching mock auth
          owner_id: 'owner-1',
          address: '123 Main St, Austin, TX 78701',
          parcel_number: 'PAR123456',
          estimated_savings: 2500,
          appeal_status: {
            appeal_status: 'approved',
            exemption_status: 'active',
            auto_appeal_enabled: true,
            savings_amount: 2500
          }
        },
        {
          id: 'prop-2',
          user_id: '550e8400-e29b-41d4-a716-446655440001', // UUID format matching mock auth
          owner_id: 'owner-1',
          address: '456 Oak Ave, Austin, TX 78702',
          parcel_number: 'PAR654321',
          estimated_savings: 1800,
          appeal_status: {
            appeal_status: 'pending',
            exemption_status: 'pending',
            auto_appeal_enabled: false,
            savings_amount: 1800
          }
        }
      ];

      const sampleOwners: MockOwner[] = [
        {
          id: 'owner-1',
          name: 'John Doe',
          owner_type: 'individual',
          created_by_user_id: '550e8400-e29b-41d4-a716-446655440001', // UUID format
          notes: 'Relationship to property: homeowner'
        }
      ];

      localStorage.setItem(this.MOCK_PROPERTIES_KEY, JSON.stringify(sampleProperties));
      localStorage.setItem(this.MOCK_OWNERS_KEY, JSON.stringify(sampleOwners));
    }
  }

  private getMockProperties(): MockProperty[] {
    const properties = localStorage.getItem(this.MOCK_PROPERTIES_KEY);
    return properties ? JSON.parse(properties) : [];
  }

  private getMockOwners(): MockOwner[] {
    const owners = localStorage.getItem(this.MOCK_OWNERS_KEY);
    return owners ? JSON.parse(owners) : [];
  }

  private getMockApplications(): MockApplication[] {
    const applications = localStorage.getItem(this.MOCK_APPLICATIONS_KEY);
    return applications ? JSON.parse(applications) : [];
  }

  private getSubmittedEmails(): string[] {
    const emails = localStorage.getItem(this.MOCK_EMAILS_KEY);
    return emails ? JSON.parse(emails) : [];
  }

  private saveSubmittedEmail(email: string) {
    const emails = this.getSubmittedEmails();
    if (!emails.includes(email)) {
      emails.push(email);
      localStorage.setItem(this.MOCK_EMAILS_KEY, JSON.stringify(emails));
    }
  }

  // Main form submission method (replaces useFormSubmission hook)
  async submitFormData(formData: FormData): Promise<MockSubmissionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Check if email already exists
      const submittedEmails = this.getSubmittedEmails();
      if (submittedEmails.includes(formData.email)) {
        return {
          success: false,
          error: "EMAIL_EXISTS_PENDING",
        };
      }

      // Generate IDs
      const tempUserId = `user-${Date.now()}`;
      const ownerId = `owner-${Date.now()}`;
      const propertyId = `prop-${Date.now()}`;
      const applicationId = `app-${Date.now()}`;
      const profileId = `profile-${Date.now()}`;

      // Create owner
      let ownerName = '';
      let ownerType = 'individual';
      
      if (formData.isTrustEntity && formData.entityName) {
        ownerName = formData.entityName;
        ownerType = formData.entityType?.toLowerCase() || 'entity';
      } else {
        ownerName = `${formData.firstName} ${formData.lastName}`;
      }

      const newOwner: MockOwner = {
        id: ownerId,
        name: ownerName,
        owner_type: ownerType,
        created_by_user_id: tempUserId,
        entity_relationship: formData.relationshipToEntity,
        form_entity_name: formData.entityName,
        form_entity_type: formData.entityType,
        notes: `Relationship to property: ${formData.role || 'homeowner'}`,
      };

      // Create property
      const newProperty: MockProperty = {
        id: propertyId,
        user_id: tempUserId,
        owner_id: ownerId,
        address: formData.address,
        parcel_number: formData.parcelNumber,
        estimated_savings: formData.estimatedSavings,
        include_all_properties: formData.includeAllProperties,
        appeal_status: {
          appeal_status: 'pending',
          exemption_status: 'pending',
          auto_appeal_enabled: false,
          savings_amount: formData.estimatedSavings || 0,
        }
      };

      // Create application
      const newApplication: MockApplication = {
        id: applicationId,
        user_id: tempUserId,
        property_id: propertyId,
        signature: formData.signature,
        is_owner_verified: formData.isOwnerVerified,
        status: 'submitted',
      };

      // Save to localStorage
      const properties = this.getMockProperties();
      const owners = this.getMockOwners();
      const applications = this.getMockApplications();

      properties.push(newProperty);
      owners.push(newOwner);
      applications.push(newApplication);

      localStorage.setItem(this.MOCK_PROPERTIES_KEY, JSON.stringify(properties));
      localStorage.setItem(this.MOCK_OWNERS_KEY, JSON.stringify(owners));
      localStorage.setItem(this.MOCK_APPLICATIONS_KEY, JSON.stringify(applications));

      // Mark email as submitted
      this.saveSubmittedEmail(formData.email);

      // Create a user account for future login
      mockAuthService.createMockUser(formData.email, 'customer');

      // Simulate PDF generation
      console.log('Mock: Generated Form 50-162 PDF');
      console.log('Mock: Generated Services Agreement PDF');

      // Handle referral code
      if (formData.referralCode) {
        console.log(`Mock: Processed referral code: ${formData.referralCode}`);
      }

      return {
        success: true,
        profileId,
        propertyId,
      };

    } catch (error: any) {
      console.error('Mock form submission error:', error);
      return {
        success: false,
        error: error.message || 'Submission failed',
      };
    }
  }

  // Get properties for a user (replaces Supabase queries)
  async getPropertiesForUser(userId: string): Promise<MockProperty[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const properties = this.getMockProperties();
    return properties.filter(p => p.user_id === userId);
  }

  // Toggle auto appeal (replaces Supabase update)
  async toggleAutoAppeal(propertyId: string): Promise<{ error: any }> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const properties = this.getMockProperties();
    const propertyIndex = properties.findIndex(p => p.id === propertyId);
    
    if (propertyIndex === -1) {
      return { error: { message: 'Property not found' } };
    }

    const property = properties[propertyIndex];
    if (property.appeal_status) {
      property.appeal_status.auto_appeal_enabled = !property.appeal_status.auto_appeal_enabled;
      properties[propertyIndex] = property;
      localStorage.setItem(this.MOCK_PROPERTIES_KEY, JSON.stringify(properties));
    }

    return { error: null };
  }

  // Clear all mock data (for testing)
  clearMockData() {
    localStorage.removeItem(this.MOCK_PROPERTIES_KEY);
    localStorage.removeItem(this.MOCK_OWNERS_KEY);
    localStorage.removeItem(this.MOCK_APPLICATIONS_KEY);
    localStorage.removeItem(this.MOCK_EMAILS_KEY);
    this.initializeMockData();
  }
}

// Export singleton instance
export const mockFormService = new MockFormService();

// Export types
export type { MockProperty, MockOwner, MockApplication, MockSubmissionResult };