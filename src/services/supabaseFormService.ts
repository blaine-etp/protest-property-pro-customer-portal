import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';

export interface SupabaseSubmissionResult {
  success: boolean;
  profileId?: string;
  propertyId?: string;
  error?: string;
  redirectTo?: string;
}

class SupabaseFormService {
  async submitFormData(formData: FormData): Promise<SupabaseSubmissionResult> {
    try {
      console.log('🔗 Supabase Form Service: Submitting form data', formData);

      // Check if email already exists
      const { data: existingProfile, error: emailCheckError } = await supabase
        .from('profiles')
        .select('user_id, email, is_authenticated')
        .eq('email', formData.email)
        .maybeSingle();

      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        throw new Error(`Email check failed: ${emailCheckError.message}`);
      }

      if (existingProfile) {
        if (existingProfile.is_authenticated) {
          return {
            success: false,
            error: 'EMAIL_EXISTS_AUTHENTICATED',
          };
        } else {
          return {
            success: false,
            error: 'EMAIL_EXISTS_PENDING',
          };
        }
      }

      // Check for duplicate property address
      const { data: existingProperty, error: propertyCheckError } = await supabase
        .from('properties')
        .select('id, situs_address')
        .eq('situs_address', formData.address)
        .maybeSingle();

      if (propertyCheckError && propertyCheckError.code !== 'PGRST116') {
        throw new Error(`Property check failed: ${propertyCheckError.message}`);
      }

      if (existingProperty) {
        return {
          success: false,
          error: 'A property at this address already exists in our system.',
        };
      }

      // Create new user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: 'temp-password-' + Math.random().toString(36).slice(-8),
        options: {
          emailRedirectTo: `${window.location.origin}/email-verification`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (authError) {
        throw new Error(`Account creation failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned');
      }

      const userId = authData.user.id;

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role || 'homeowner',
          is_trust_entity: formData.isTrustEntity || false,
          agree_to_updates: formData.agreeToUpdates || true,
          is_authenticated: false, // Will be true after email verification
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Create contact record
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company: formData.isTrustEntity ? formData.entityName : null,
          status: 'active',
          source: 'website_signup'
        })
        .select()
        .single();

      if (contactError) {
        throw new Error(`Contact creation failed: ${contactError.message}`);
      }

      // Create property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: userId,
          contact_id: contact.id,
          situs_address: formData.address,
          parcel_number: formData.parcelNumber,
          estimated_savings: formData.estimatedSavings,
          include_all_properties: formData.includeAllProperties,
          place_id: formData.placeId,
          formatted_address: formData.formattedAddress,
          google_address_components: formData.addressComponents,
          latitude: formData.latitude,
          longitude: formData.longitude,
          county: formData.county,
        })
        .select()
        .single();

      if (propertyError) {
        throw new Error(`Property creation failed: ${propertyError.message}`);
      }

      // Create owner record
      let ownerName = '';
      let ownerType = 'individual';
      let entityRelationship = null;
      let formEntityName = null;
      let formEntityType = null;

      if (formData.isTrustEntity && formData.entityName) {
        ownerName = formData.entityName;
        ownerType = formData.entityType?.toLowerCase() || 'entity';
        entityRelationship = formData.relationshipToEntity;
        formEntityName = formData.entityName;
        formEntityType = formData.entityType;
      } else {
        ownerName = `${formData.firstName} ${formData.lastName}`;
        ownerType = 'individual';
      }

      const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .insert({
          name: ownerName,
          owner_type: ownerType,
          created_by_user_id: userId,
          entity_relationship: entityRelationship,
          form_entity_name: formEntityName,
          form_entity_type: formEntityType,
          contact_info: {
            email: formData.email,
            phone: formData.phone
          },
        })
        .select()
        .single();

      if (ownerError) {
        throw new Error(`Owner creation failed: ${ownerError.message}`);
      }

      // Update property with owner_id
      const { error: propertyUpdateError } = await supabase
        .from('properties')
        .update({ owner_id: owner.id })
        .eq('id', property.id);

      if (propertyUpdateError) {
        throw new Error(`Property owner update failed: ${propertyUpdateError.message}`);
      }

      // Create application record
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          property_id: property.id,
          signature: formData.signature,
          is_owner_verified: formData.isOwnerVerified,
          status: 'submitted',
        });

      if (applicationError) {
        throw new Error(`Application creation failed: ${applicationError.message}`);
      }

      // Create initial protest record
      const { data: protestData, error: protestError } = await supabase
        .from('protests')
        .insert({
          property_id: property.id,
          appeal_status: 'pending',
          exemption_status: 'pending',
          savings_amount: formData.estimatedSavings || 0,
        })
        .select()
        .single();

      if (protestError) {
        throw new Error(`Protest record creation failed: ${protestError.message}`);
      }

      // Create draft bill
      const { error: billError } = await supabase
        .from('bills')
        .insert({
          protest_id: protestData.id,
          tax_year: new Date().getFullYear(),
          status: 'draft',
          total_assessed_value: formData.estimatedSavings ? Number(formData.estimatedSavings) * 4 : 0,
          total_protest_amount: 0,
          total_fee_amount: 0,
          contingency_fee_percent: 25.00
        });

      if (billError) {
        console.error('Error creating bill:', billError);
      }

      // Generate PDF documents
      try {
        await supabase.functions.invoke('generate-form-50-162', {
          body: { 
            propertyId: property.id, 
            userId: userId 
          }
        });
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
      }

      // Handle referral code
      if (formData.referralCode) {
        // Implementation for referral handling would go here
        console.log('Referral code provided:', formData.referralCode);
      }

      // Sign out the user since they need to verify email first
      await supabase.auth.signOut();

      return {
        success: true,
        profileId: profile.id,
        propertyId: property.id,
        redirectTo: '/email-verification'
      };

    } catch (error: any) {
      console.error('Supabase form submission error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get properties for a user (matching mock interface)
  async getPropertiesForUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:owners(*)
        `)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }

  // Toggle auto appeal (matching mock interface)
  async toggleAutoAppeal(propertyId: string) {
    try {
      // First get the current value
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('auto_appeal_enabled')
        .eq('id', propertyId)
        .single();

      if (fetchError) {
        return { error: fetchError };
      }

      // Toggle the value
      const { error: updateError } = await supabase
        .from('properties')
        .update({ auto_appeal_enabled: !property.auto_appeal_enabled })
        .eq('id', propertyId);

      return { error: updateError };
    } catch (error) {
      console.error('Error toggling auto appeal:', error);
      return { error };
    }
  }
}

export const supabaseFormService = new SupabaseFormService();
export { SupabaseFormService };