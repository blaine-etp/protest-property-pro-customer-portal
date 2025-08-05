import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';
import { mockAuthService } from '@/services/mockAuthService';

interface AddPropertySubmissionProps {
  existingUserId: string;
  isTokenAccess: boolean;
  forceDatabaseSave?: boolean;
}

export const useAddPropertySubmission = ({ existingUserId, isTokenAccess, forceDatabaseSave = false }: AddPropertySubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitAddProperty = async (formData: FormData) => {
    // Prevent double submissions
    if (isSubmitting) {
      console.log('🛑 Submission already in progress, ignoring duplicate call');
      return { success: false, error: 'Submission already in progress' };
    }
    
    setIsSubmitting(true);
    
    try {
      // Check for duplicate property address for this user
      if (!existingUserId.startsWith('550e8400') || forceDatabaseSave) {
        const { data: existingProperty, error: duplicateCheckError } = await supabase
          .from('properties')
          .select('id, situs_address')
          .eq('user_id', existingUserId)
          .eq('situs_address', formData.address)
          .maybeSingle();

        if (duplicateCheckError && duplicateCheckError.code !== 'PGRST116') {
          throw new Error(`Duplicate check failed: ${duplicateCheckError.message}`);
        }

        if (existingProperty) {
          toast({
            title: "Property Already Exists",
            description: "You already have a property at this address in your account.",
            variant: "destructive",
          });
          return { success: false, error: 'Property already exists at this address' };
        }
      }
      // Check if we're using mock auth (mock user IDs have UUID format starting with 550e8400)
      // But skip mock mode if forceDatabaseSave is enabled
      const isMockMode = existingUserId.startsWith('550e8400') && !forceDatabaseSave;
      
      if (isMockMode) {
        // Simulate mock property addition
        console.log('🎭 Mock mode: Simulating property addition...');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock successful property creation
        const mockPropertyId = `550e8400-e29b-41d4-a716-${Date.now().toString().slice(-12).padStart(12, '0')}`;
        
        console.log('🎭 Mock property created:', {
          id: mockPropertyId,
          address: formData.address,
          user_id: existingUserId
        });
        
        toast({
          title: "Property Added Successfully",
          description: "Your new property has been added to your account!",
        });

        return { 
          success: true, 
          propertyId: mockPropertyId 
        };
      }

      // Real Supabase implementation for non-mock users
      // 0. Ensure profile exists for the user (defensive programming)
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', existingUserId)
        .maybeSingle();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        throw new Error(`Profile check failed: ${profileCheckError.message}`);
      }

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            user_id: existingUserId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            is_trust_entity: formData.isTrustEntity,
            role: formData.role,
            agree_to_updates: formData.agreeToUpdates,
            is_authenticated: true,
            permissions: 'user'
          });

        if (profileCreateError) {
          throw new Error(`Profile creation failed: ${profileCreateError.message}`);
        }
        console.log('✅ Created missing profile for user:', existingUserId);
      }

      // 1. Find or create contact record for the user
      let contactId = null;
      const { data: existingContact, error: contactCheckError } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (contactCheckError && contactCheckError.code !== 'PGRST116') {
        throw new Error(`Contact check failed: ${contactCheckError.message}`);
      }

      if (existingContact) {
        contactId = existingContact.id;
        console.log('🔍 Using existing contact:', contactId);
      } else {
        // Create new contact record
        const { data: newContact, error: contactError } = await supabase
          .from('contacts')
          .insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            company: formData.isTrustEntity ? formData.entityName : null,
            status: 'active',
            source: 'property_signup'
          })
          .select()
          .single();

        if (contactError) {
          throw new Error(`Contact creation failed: ${contactError.message}`);
        }
        contactId = newContact.id;
        console.log('✅ Created new contact:', contactId);
      }

      // 2. Update existing profile with any changed personal info (except email/phone)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          is_trust_entity: formData.isTrustEntity,
          role: formData.role,
          agree_to_updates: formData.agreeToUpdates,
        })
        .eq('user_id', existingUserId);

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      // 3. Create new property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: existingUserId,
          contact_id: contactId, // Link to contact
          situs_address: formData.address,
          parcel_number: formData.parcelNumber,
          estimated_savings: formData.estimatedSavings,
          include_all_properties: formData.includeAllProperties,
          // Google Places data
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

      // 4. Create owner record for this property
      let ownerName = '';
      let ownerType = 'individual';
      let entityRelationship = null;
      let formEntityName = null;
      let formEntityType = null;

      if (formData.isTrustEntity && formData.entityName) {
        // Entity/Trust owner
        ownerName = formData.entityName;
        ownerType = formData.entityType?.toLowerCase() || 'entity';
        entityRelationship = formData.relationshipToEntity;
        formEntityName = formData.entityName;
        formEntityType = formData.entityType;
      } else {
        // Individual owner
        ownerName = `${formData.firstName} ${formData.lastName}`;
        ownerType = 'individual';
      }

      const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .insert({
          name: ownerName,
          owner_type: ownerType,
          created_by_user_id: existingUserId,
          entity_relationship: entityRelationship,
          form_entity_name: formEntityName,
          form_entity_type: formEntityType,
          contact_info: {
            email: formData.email,
            phone: formData.phone
          },
          notes: formData.isTrustEntity ? `Entity: ${formData.entityName}` : null
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

      // 5. Create application record for new property
      console.log('📝 Creating application record with signature data:', {
        hasSignature: !!formData.signature,
        signatureLength: formData.signature?.length || 0,
        isOwnerVerified: formData.isOwnerVerified
      });
      
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: existingUserId,
          property_id: property.id,
          signature: formData.signature,
          is_owner_verified: formData.isOwnerVerified,
          status: 'submitted',
        })
        .select()
        .single();

      if (applicationError) {
        throw new Error(`Application creation failed: ${applicationError.message}`);
      }

      // 6. Create initial protest record for new property
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

      // 7. Create draft bill for the protest
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
        // Don't throw here as the main application was successful
      }

      // Generate Form 50-162 automatically (property-specific)
      console.log('📄 Generating Form 50-162 for property:', property.id);
      try {
        const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-form-50-162', {
          body: { 
            propertyId: property.id, 
            userId: existingUserId 
          }
        });
        
        if (pdfError) {
          console.error('❌ PDF generation failed:', pdfError);
          toast({
            title: "PDF Generation Warning",
            description: "Property added successfully, but Form 50-162 generation failed",
            variant: "destructive",
          });
        } else if (pdfData?.isExisting) {
          console.log('📄 Using existing Form 50-162 for today:', pdfData.filename);
          toast({
            title: "Form 50-162 Already Generated",
            description: "A Form 50-162 for this property was already generated today",
          });
        } else {
          console.log('✅ Form 50-162 generated successfully:', pdfData);
          toast({
            title: "Form 50-162 Generated", 
            description: "Property-specific tax protest form created successfully",
          });
        }
      } catch (pdfError) {
        console.error('❌ PDF generation error:', pdfError);
        toast({
          title: "PDF Generation Warning",
          description: "Property added successfully, but Form 50-162 generation failed",
          variant: "destructive",
        });
      }

      toast({
        title: "Property Added Successfully",
        description: "Your new property has been added to your account!",
      });

      return { 
        success: true, 
        propertyId: property.id 
      };
    } catch (error: any) {
      console.error('Add property submission error:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      if (error.message?.includes('row-level security')) {
        errorMessage = 'There was an authentication issue. Please try again or contact support.';
      }
      
      toast({
        title: "Failed to Add Property",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitAddProperty, isSubmitting };
};