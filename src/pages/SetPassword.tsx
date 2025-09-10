import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get('userId');
  const redirectParam = searchParams.get('redirect');

  useEffect(() => {
    const init = async () => {
      try {
        // Handle email verification and password recovery
        const hash = window.location.hash || '';
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        // Or from "code" or "token" or "token_hash" query params (signup/recovery)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const token_hash = urlParams.get('token_hash');
        const token = urlParams.get('token');
        const type = urlParams.get('type');

        console.debug('[SetPassword] Params detected', { access_token, refresh_token, code, token_hash, token, type });

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          setIsEmailConfirmed(true);
          toast({ title: 'Email Confirmed', description: 'Please set your password to complete setup.' });
          // Clean URL
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }

        // Handle OTP-based links (e.g., type=signup or type=recovery)
        if ((token || token_hash) && type) {
          console.debug('[SetPassword] Verifying OTP via link', { type, using: token_hash ? 'token_hash' : 'token' });
          const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash: token_hash ?? token! });
          if (error) throw error;
          setIsEmailConfirmed(true);
          toast({ title: 'Email Confirmed', description: 'Please set your password to complete setup.' });
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setIsEmailConfirmed(true);
          toast({ title: 'Email Confirmed', description: 'Please set your password to complete setup.' });
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }

        // Fallback: check existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          return;
        }
        if (session?.user) {
          setIsEmailConfirmed(true);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: 'Link invalid or expired',
          description: 'Request a new password link from the sign-in page.',
          variant: 'destructive',
        });
      }
    };

    // Listen for password recovery or sign-in events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setIsEmailConfirmed(true);
      }
    });

    init();
    return () => subscription.unsubscribe();
  }, [toast]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      // Mark user as authenticated in their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ is_authenticated: true })
          .eq('user_id', user.id);

          if (profileUpdateError) {
            console.error('❌ Profile update failed:', profileUpdateError);
          } else {
            console.log('✅ Profile updated to is_authenticated: true');
          }
      }

      toast({
        title: "Password Set Successfully",
        description: "Your password has been set. Redirecting to your dashboard...",
      });

      // Always redirect to customer portal (no admin permissions check needed)
      setTimeout(() => {
        navigate('/customer-portal');
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Password Update Failed",
        description: error.message || "Failed to set password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Set Your Password
            </CardTitle>
            <CardDescription>
              {isEmailConfirmed 
                ? "Your email has been confirmed. Please set a secure password for your account."
                : "Set a secure password for your account."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || password.length < 6 || password !== confirmPassword}>
                <Lock className="h-4 w-4 mr-2" />
                {isLoading ? 'Setting Password...' : 'Set Password'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                After setting your password, you'll be automatically signed in and redirected to your dashboard.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Having trouble? <Link to="/auth" className="underline hover:text-primary">Request a new link</Link> and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}