import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';




export const useSimplifiedFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();


  
  const submitFormData = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = { formData, origin: window.location.origin };


   
    try {
      
      const { data, error } = await supabase.functions.invoke('submit-application', {
        body: payload,
      });

      if (error || !data?.success) {
        const errorMessage = error?.message || data?.error || 'Submission failed';
        const errorCode = data?.code;
        if (errorCode === 'MISSING_PLACE_ID') {
          return { success: false, showSupport: true, error: errorMessage } as const;
        }
        throw new Error(errorMessage);
      }

      // NEW USER: Email verification required
      if (data?.requiresEmailConfirmation) {
        toast({ 
          title: 'Check Your Email!', 
          description: 'We sent you a confirmation link. Please verify your email to continue.' 
        });
        window.location.href = '/email-verification?email=' + encodeURIComponent(formData.email);
        return { success: true };
      }

      // EXISTING USER: Direct redirect
      if (data?.redirectTo) {
        toast({ 
          title: 'Welcome Back!', 
          description: 'Property added successfully!' 
        });
        window.location.href = data.redirectTo;
        return { success: true };
      }

      toast({ title: 'Success!', description: 'Application submitted successfully.' });
      return { success: true };
      
    } catch (err: any) {
      toast({ title: 'Submission Failed', description: err.message, variant: 'destructive' });
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFormData, isSubmitting };
};


