import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormData } from '@/components/MultiStepForm';
import { useToast } from '@/hooks/use-toast';

// Fallback direct call config (only used if supabase.functions.invoke fails)
const SUPABASE_URL = "https://phxgvegpibyjdxsqtdwb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoeGd2ZWdwaWJ5amR4c3F0ZHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxOTg1NzYsImV4cCI6MjA2Nzc3NDU3Nn0.ckmBimMD-UxtVD13zFOccK2_oHZWLiwq-OtpEFGD91Y";

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
    const payload = { formData, origin: window.location.origin } as const;
    try {
      // Primary path: Supabase client invocation
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

      const magicLink: string | undefined = data?.magicLink;
      if (magicLink) {
        cleanupAuthState();
        try { await supabase.auth.signOut({ scope: 'global' } as any); } catch {}
        window.location.href = magicLink;
        return { success: true, didRedirect: true } as const;
      }

      toast({ title: 'Application Submitted', description: 'Your application was submitted successfully.' });
      return { success: true } as const;
    } catch (primaryErr: any) {
      console.warn('Primary edge function call failed, attempting fallback fetch...', primaryErr);
      // Fallback: direct fetch to Edge Function URL (handles rare invoke transport issues)
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-application`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data?.success) {
          const errorCode = data?.code;
          if (errorCode === 'MISSING_PLACE_ID') {
            return { success: false, showSupport: true, error: data?.error || 'Place ID required' } as const;
          }
          throw new Error(data?.error || 'Submission failed');
        }

        const magicLink: string | undefined = data?.magicLink;
        if (magicLink) {
          cleanupAuthState();
          try { await supabase.auth.signOut({ scope: 'global' } as any); } catch {}
          window.location.href = magicLink;
          return { success: true, didRedirect: true } as const;
        }

        toast({ title: 'Application Submitted', description: 'Your application was submitted successfully.' });
        return { success: true } as const;
      } catch (fallbackErr: any) {
        console.error('Fallback edge function fetch failed:', fallbackErr);
        const message = fallbackErr?.message || primaryErr?.message || 'Please try again.';
        toast({ title: 'Submission Failed', description: message, variant: 'destructive' });
        return { success: false, error: message } as const;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFormData, isSubmitting };
};
