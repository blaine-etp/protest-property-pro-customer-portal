import { useState } from 'react';
import { formService } from '@/services';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';


export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitFormData = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Use mock form service for submission
      const result = await formService.submitFormData(formData);
      
      if (!result.success) {
        if (result.error === "EMAIL_EXISTS_PENDING") {
          toast({
            title: "Application Already Submitted",
            description: "You've already submitted an application with this email. Please check your email for account setup instructions.",
            variant: "destructive",
          });
          return { 
            success: false, 
            error: "EMAIL_EXISTS_PENDING"
          };
        } else if (result.error === "EMAIL_EXISTS_AUTHENTICATED") {
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
          throw new Error(result.error || 'Submission failed');
        }
      }

      toast({
        title: "Application Submitted Successfully",
        description: "Your application has been submitted! You can now sign in to access your account.",
      });

      return { 
        success: true,
        profileId: result.profileId, 
        propertyId: result.propertyId 
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