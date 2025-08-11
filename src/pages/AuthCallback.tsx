import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function parseHashParams(hash: string) {
  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(cleaned);
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Listen for auth events first to avoid missing session init
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Route password recovery to set-password
      if (event === 'PASSWORD_RECOVERY') {
        // Defer to ensure session is fully set
        setTimeout(() => navigate('/set-password', { replace: true }), 0);
        return;
      }

      // After magic link / email confirmation
      if (event === 'SIGNED_IN' && session?.user) {
        // Decide destination based on permissions
        (async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('permissions')
              .eq('user_id', session.user.id)
              .single();

            const isAdmin = profile?.permissions === 'administrator' || profile?.permissions === 'admin';
            navigate(isAdmin ? '/admin' : '/customer-portal', { replace: true });
          } catch {
            navigate('/customer-portal', { replace: true });
          }
        })();
      }
    });

    // 2) Inspect URL hash for explicit recovery type (fallback)
    const params = parseHashParams(window.location.hash);
    const type = params.get('type');

    if (type === 'recovery') {
      // Let Supabase process tokens, then go to set-password
      setTimeout(() => navigate('/set-password', { replace: true }), 50);
    }

    // 3) Clean URL hash for aesthetics
    if (window.location.hash) {
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    document.title = 'Authenticate | Protest Property Pro';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Signing you in…</CardTitle>
          <CardDescription>Processing your secure link.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    </div>
  );
}
