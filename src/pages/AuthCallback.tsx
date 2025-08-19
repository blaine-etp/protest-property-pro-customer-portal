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
    // 1) Listen for auth events first to avoid missing session init
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Route password recovery to set-password
      if (event === 'PASSWORD_RECOVERY') {
        // Clean hash and navigate
        setTimeout(() => {
          cleanUrlHash();
          navigate('/set-password', { replace: true });
        }, 0);
        return;
      }

      // After magic link / email confirmation
      if (event === 'SIGNED_IN' && session?.user) {
        // Defer any Supabase calls to avoid deadlocks
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('permissions')
              .eq('user_id', session.user!.id)
              .single();

            const isAdmin = profile?.permissions === 'administrator' || profile?.permissions === 'admin';
            cleanUrlHash();
            navigate(isAdmin ? '/admin' : '/customer-portal', { replace: true });
          } catch {
            cleanUrlHash();
            navigate('/customer-portal', { replace: true });
          }
        }, 0);
      }
    });

    // 2) Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('permissions')
              .eq('user_id', session.user!.id)
              .single();

            const isAdmin = profile?.permissions === 'administrator' || profile?.permissions === 'admin';
            cleanUrlHash();
            navigate(isAdmin ? '/admin' : '/customer-portal', { replace: true });
          } catch {
            cleanUrlHash();
            navigate('/customer-portal', { replace: true });
          }
        }, 0);
      }
    });

    // 3) Inspect URL hash for explicit recovery type (fallback)
    const params = parseHashParams(window.location.hash);
    const type = params.get('type');

    if (type === 'recovery' || type === 'invite' || type === 'signup') {
      // Let Supabase process tokens, then go to set-password
      setTimeout(() => {
        cleanUrlHash();
        navigate('/set-password', { replace: true });
      }, 0);
    }

    // 4) Set timeout fallback
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true);
    }, 10000);

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
    
    if (type === 'recovery' || type === 'invite' || type === 'signup') {
      navigate('/set-password', { replace: true });
    } else {
      navigate('/auth', { replace: true });
    }
  };

  useEffect(() => {
    document.title = 'Authenticate | Protest Property Pro';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Signing you in…</CardTitle>
          <CardDescription>
            {showFallback 
              ? "Taking longer than expected. You can try manual navigation." 
              : "Processing your secure link."}
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
                Continue Authentication
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
