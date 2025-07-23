import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';
import { mockAuthService } from '@/services/mockAuthService';

interface AddPropertySubmissionProps {
  existingUserId: string;
  isTokenAccess: boolean;
}

export const useAddPropertySubmission = ({ existingUserId, isTokenAccess }: AddPropertySubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitAddProperty = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Check if we're using mock auth (mock user IDs have UUID format starting with 550e8400)
      const isMockMode = existingUserId.startsWith('550e8400');
      
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
      // 1. Update existing profile with any changed personal info (except email/phone)
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

      // 2. Create new property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: existingUserId,
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

      // 3. Create owner record if entity is involved
      let ownerId = null;
      if (formData.isTrustEntity && formData.entityName) {
        const { data: owner, error: ownerError } = await supabase
          .from('owners')
          .insert({
            name: formData.entityName,
            owner_type: formData.entityType?.toLowerCase() || 'entity',
            property_id: property.id,
            created_by_user_id: existingUserId,
            entity_relationship: formData.relationshipToEntity,
            form_entity_name: formData.entityName,
            form_entity_type: formData.entityType,
          })
          .select()
          .single();

        if (ownerError) {
          throw new Error(`Owner creation failed: ${ownerError.message}`);
        }
        ownerId = owner.id;

        // Update property with owner_id
        const { error: propertyUpdateError } = await supabase
          .from('properties')
          .update({ owner_id: ownerId })
          .eq('id', property.id);

        if (propertyUpdateError) {
          throw new Error(`Property owner update failed: ${propertyUpdateError.message}`);
        }
      }

      // 4. Create application record for new property
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

      // 5. Create initial protest record for new property
      const { error: protestError } = await supabase
        .from('protests')
        .insert({
          property_id: property.id,
          appeal_status: 'pending',
          exemption_status: 'pending',
          auto_appeal_enabled: false,
          savings_amount: formData.estimatedSavings || 0,
        });

      if (protestError) {
        throw new Error(`Protest record creation failed: ${protestError.message}`);
      }

      // Generate Form 50-162 automatically
      try {
        const { error: pdfError } = await supabase.functions.invoke('generate-form-50-162', {
          body: { 
            propertyId: property.id, 
            userId: existingUserId 
          }
        });
        
        if (pdfError) {
          console.error('PDF generation failed:', pdfError);
        } else {
          console.log('Form 50-162 generated successfully');
        }
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        // Don't fail the submission if PDF generation fails
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