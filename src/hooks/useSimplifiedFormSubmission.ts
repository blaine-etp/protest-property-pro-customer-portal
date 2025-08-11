import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';

export const useSimplifiedFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const cleanupAuthState = () => {
    try {
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch {}
  };

  const submitFormData = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-application', {
        body: {
          formData,
          origin: window.location.origin,
        },
      });

      if (error) throw new Error(error.message || 'Submission failed');
      if (!data?.success) throw new Error(data?.error || 'Submission failed');

      const magicLink: string | undefined = data?.magicLink;
      if (magicLink) {
        // Clean up any stale auth and redirect to magic link for instant portal access
        cleanupAuthState();
        try { await supabase.auth.signOut({ scope: 'global' } as any); } catch {}
        window.location.href = magicLink;
        return { success: true, didRedirect: true } as const;
      }

      toast({
        title: 'Application Submitted',
        description: 'Your application was submitted successfully.',
      });
      return { success: true } as const;
    } catch (err: any) {
      console.error('Form submission error:', err);
      toast({
        title: 'Submission Failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
      return { success: false, error: err.message } as const;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFormData, isSubmitting };
};
