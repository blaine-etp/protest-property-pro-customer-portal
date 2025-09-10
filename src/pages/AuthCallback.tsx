import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function parseHashParams(hash: string) {
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(cleaned);
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check URL parameters for auth type
    const hashParams = parseHashParams(window.location.hash);
    const urlParams = new URLSearchParams(window.location.search);
    const authType = hashParams.get('type') || urlParams.get('type');
    
    // Handle password recovery
    if (authType === 'recovery') {
      setTimeout(() => {
        cleanUrlHash();
        navigate('/set-password', { replace: true });
      }, 100);
      return;
    }

    // Handle email confirmation
    if (authType === 'signup') {
      setTimeout(() => {
        cleanUrlHash();
        navigate('/set-password', { replace: true });
      }, 100);
      return;
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTimeout(() => {
          cleanUrlHash();
          navigate('/set-password', { replace: true });
        }, 100);
        return;
      }

      // After successful email confirmation - customer portal only
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          cleanUrlHash();
          navigate('/customer-portal', { replace: true });
        }, 100);
        return;
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setTimeout(() => {
          cleanUrlHash();
          navigate('/customer-portal', { replace: true });
        }, 100);
      }
    });

    // Set timeout fallback
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [navigate]);

  const cleanUrlHash = () => {
    if (window.location.hash) {
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
  };

  const handleManualNavigation = () => {
    const params = parseHashParams(window.location.hash);
    const type = params.get('type');
    
    if (type === 'recovery' || type === 'signup') {
      navigate('/set-password', { replace: true });
    } else {
      navigate('/customer-portal', { replace: true });
    }
  };

  useEffect(() => {
    document.title = 'Authenticating | Protest Property Pro';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Signing you in…</CardTitle>
          <CardDescription>
            {showFallback 
              ? "Taking longer than expected. You can try manual navigation." 
              : "Processing your email verification link."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          {!showFallback ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="space-y-3 w-full">
              <Button 
                onClick={handleManualNavigation}
                className="w-full"
                variant="default"
              >
                Continue to Portal
              </Button>
              <Button 
                onClick={() => navigate('/auth', { replace: true })}
                className="w-full"
                variant="outline"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}