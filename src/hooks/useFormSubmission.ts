import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFormData = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Check if email exists in profiles table (pending or authenticated users)
      const { data: existingProfiles, error: profileCheckError } = await supabase
        .from('profiles')
        .select('email, is_authenticated')
        .eq('email', formData.email);

      if (profileCheckError) {
        console.error('Profile check error:', profileCheckError);
      } else if (existingProfiles && existingProfiles.length > 0) {
        const existingProfile = existingProfiles[0];
        if (existingProfile.is_authenticated) {
          toast({
            title: "Email Already Registered",
            description: "This email is already registered. Please sign in to access your account.",
            variant: "destructive",
          });
          return { 
            success: false, 
            error: "EMAIL_EXISTS_AUTHENTICATED",
            redirectTo: "/auth"
          };
        } else {
          toast({
            title: "Application Already Submitted",
            description: "You've already submitted an application with this email. Please check your email for account setup instructions.",
            variant: "destructive",
          });
          return { 
            success: false, 
            error: "EMAIL_EXISTS_PENDING"
          };
        }
      }

      // Generate a temporary user ID for data storage (will be linked to real auth user later)
      const tempUserId = crypto.randomUUID();

      // 1. Create user profile with token (no authentication required)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: tempUserId, // Use temporary ID
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          is_trust_entity: formData.isTrustEntity,
          role: formData.role,
          agree_to_updates: formData.agreeToUpdates,
          is_authenticated: false, // Mark as not yet authenticated
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Get the generated authentication token
      const authToken = profile.authentication_token;

      // 2. Create property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: tempUserId,
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
          user_id: tempUserId,
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

      // Generate both PDFs automatically for new customers
      try {
        // Generate Form 50-162
        const { error: form50162Error } = await supabase.functions.invoke('generate-form-50-162', {
          body: { 
            propertyId: property.id, 
            userId: tempUserId 
          }
        });

        // Generate Services Agreement (only for new customers)
        const { error: servicesAgreementError } = await supabase.functions.invoke('generate-services-agreement', {
          body: { 
            propertyId: property.id, 
            userId: tempUserId 
          }
        });
        
        if (form50162Error) {
          console.error('Form 50-162 generation failed:', form50162Error);
        } else {
          console.log('Form 50-162 generated successfully');
        }

        if (servicesAgreementError) {
          console.error('Services Agreement generation failed:', servicesAgreementError);
        } else {
          console.log('Services Agreement generated successfully');
        }
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        // Don't fail the submission if PDF generation fails
      }

      toast({
        title: "Application Submitted Successfully",
        description: "Your application has been submitted! You'll receive an email to create your account.",
      });

      return { 
        success: true, 
        token: authToken,
        profileId: profile.id, 
        propertyId: property.id 
      };
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      if (error.message?.includes('row-level security')) {
        errorMessage = 'There was an authentication issue. Please try again or contact support.';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Please check your email and confirm your account if this is your first time submitting.';
      }
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFormData, isSubmitting };
};