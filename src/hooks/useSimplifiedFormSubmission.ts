import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';

export const useSimplifiedFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFormData = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Check if email already exists in profiles table
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

      // Step 2: Create the Supabase user with email and temporary password
      const tempPassword = `temp_${crypto.randomUUID()}`;
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/set-password`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError || !authUser.user) {
        throw new Error(`User creation failed: ${authError?.message}`);
      }

      const userId = authUser.user.id;

      // Step 3: Create user profile (this will use auth.uid() in RLS)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          is_trust_entity: formData.isTrustEntity,
          role: formData.role,
          agree_to_updates: formData.agreeToUpdates,
          is_authenticated: false, // Will be set to true when they set their password
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Step 4: Create owner record
      let ownerName = '';
      let ownerType = 'individual';
      
      if (formData.isTrustEntity && formData.entityName) {
        ownerName = formData.entityName;
        ownerType = formData.entityType?.toLowerCase() || 'entity';
      } else {
        ownerName = `${formData.firstName} ${formData.lastName}`;
      }

      const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .insert({
          name: ownerName,
          owner_type: ownerType,
          created_by_user_id: userId,
          entity_relationship: formData.relationshipToEntity,
          form_entity_name: formData.entityName,
          form_entity_type: formData.entityType,
          notes: `Relationship to property: ${formData.role || 'homeowner'}`,
          // Default mailing address to situs address initially
          mailing_address: formData.address,
          mailing_city: formData.county ? `${formData.county.replace(' County', '')}, TX` : 'Austin, TX',
          mailing_state: 'TX',
          mailing_zip: '78701', // Default - will be updated by AWS integration
        })
        .select()
        .single();

      if (ownerError) {
        throw new Error(`Owner creation failed: ${ownerError.message}`);
      }

      // Step 5: Create property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          user_id: userId,
          owner_id: owner.id,
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

      // Step 6: Create application record
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

      // Step 7: Create initial protest record
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

      // Step 8: Handle referral code if provided
      if (formData.referralCode) {
        try {
          const { data: referrerProfile, error: referrerError } = await supabase
            .from('profiles')
            .select('user_id, email, first_name, last_name')
            .eq('referral_code', formData.referralCode)
            .single();

          if (referrerError || !referrerProfile) {
            console.error('Referrer not found for code:', formData.referralCode);
          } else if (referrerProfile.email !== formData.email) {
            const { error: referralError } = await supabase
              .from('referral_relationships')
              .insert({
                referrer_id: referrerProfile.user_id,
                referee_id: userId,
                referral_code: formData.referralCode,
                referee_email: formData.email,
                referee_first_name: formData.firstName,
                referee_last_name: formData.lastName,
                status: 'completed'
              });

            if (referralError) {
              console.error('Failed to create referral relationship:', referralError);
            }
          }
        } catch (referralError) {
          console.error('Referral processing error:', referralError);
        }
      }

      // Step 9: Generate PDFs (non-blocking)
      try {
        Promise.all([
          supabase.functions.invoke('generate-form-50-162', {
            body: { propertyId: property.id, userId }
          }),
          supabase.functions.invoke('generate-services-agreement', {
            body: { propertyId: property.id, userId }
          })
        ]).catch(console.error);
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
      }

      // Step 10: Sign out the temporary user session
      await supabase.auth.signOut();

      toast({
        title: "Application Submitted Successfully",
        description: "Your application has been submitted! Please check your email to set up your account.",
      });

      return { 
        success: true,
        profileId: profile.id, 
        propertyId: property.id,
        userId: userId
      };
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      let errorMessage = error.message;
      if (error.message?.includes('row-level security')) {
        errorMessage = 'There was an authentication issue. Please try again or contact support.';
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