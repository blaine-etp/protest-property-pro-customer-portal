import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFormData = async (formData: FormData, userId: string) => {
    setIsSubmitting(true);
    
    try {
      // 1. Create or update user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          is_trust_entity: formData.isTrustEntity,
          role: formData.role,
          agree_to_updates: formData.agreeToUpdates,
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // 2. Create property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: userId,
          address: formData.address,
          parcel_number: formData.parcelNumber,
          estimated_savings: formData.estimatedSavings,
          include_all_properties: formData.includeAllProperties,
        })
        .select()
        .single();

      if (propertyError) {
        throw new Error(`Property creation failed: ${propertyError.message}`);
      }

      // 3. Create application record
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
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

      // 4. Create initial appeal status
      const { error: appealError } = await supabase
        .from('appeal_status')
        .insert({
          property_id: property.id,
          appeal_status: 'pending',
          exemption_status: 'pending',
          auto_appeal_enabled: false,
          savings_amount: formData.estimatedSavings || 0,
        });

      if (appealError) {
        throw new Error(`Appeal status creation failed: ${appealError.message}`);
      }

      toast({
        title: "Application Submitted Successfully",
        description: "Your property tax protest application has been submitted.",
      });

      return { success: true, profileId: profile.id, propertyId: property.id };
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting your application.",
        variant: "destructive",
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFormData, isSubmitting };
};