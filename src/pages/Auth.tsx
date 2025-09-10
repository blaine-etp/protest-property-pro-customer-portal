import { useState } from 'react';
import { authService, supabaseAuthService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'reset' | 'signup' | 'magic-link'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // In Auth.tsx handleSignIn function, add logging:
const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    console.log('🔍 Attempting sign in with:', { email, password: '***' });
    
    const { data, error } = await authService.signInWithPassword({
      email,
      password,
    });

    console.log('🔍 Sign in result:', { data, error });

    if (error) {
      console.error('🚫 Sign in error:', error);
      throw error;
    }

    if (data.user) {
      console.log('🔍 User signed in:', data.user.id);
      
      // Check user permissions to determine redirect
      const { data: profile } = await authService.getProfile(data.user.id);
      console.log('🔍 User profile:', profile);
        
      if (profile?.permissions === 'admin' || profile?.permissions === 'administrator') {
        navigate('/admin');
      } else {
        navigate('/customer-portal');
      }
    }
  } catch (error: any) {
    console.error('🚫 Sign in failed:', error);
    toast({
      title: "Sign In Failed",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(true);
  }
};

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await authService.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
      setMode('signin');
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabaseAuthService.signUp({ email, password });
      if (error) throw error;

      toast({
        title: 'Check your email',
        description: 'We sent you a verification link to complete your signup.',
      });
      navigate(`/email-verification?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabaseAuthService.signInWithMagicLink(email);
      if (error) throw error;

      toast({
        title: 'Magic link sent!',
        description: 'Check your email for a sign-in link.',
      });
      setMode('signin');
    } catch (error: any) {
      toast({
        title: 'Magic Link Failed',
        description: error.message,
        variant: 'destructive',
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
            <CardTitle>
              {mode === 'signin' ? 'Sign In' 
               : mode === 'signup' ? 'Create Account' 
               : mode === 'magic-link' ? 'Magic Link Sign In'
               : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin'
                ? 'Enter your email and password to access your account.'
                : mode === 'signup'
                  ? 'Create your account with email and password.'
                  : mode === 'magic-link'
                    ? 'Enter your email to receive a magic sign-in link.'
                    : 'Enter your email to receive password reset instructions.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : mode === 'magic-link' ? handleMagicLink : handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode !== 'reset' && mode !== 'magic-link' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Mail className="h-4 w-4 mr-2" />
                {isLoading
                  ? 'Processing...'
                  : mode === 'signin'
                    ? 'Sign In'
                    : mode === 'signup'
                      ? 'Create Account'
                      : mode === 'magic-link'
                        ? 'Send Magic Link'
                        : 'Send Reset Email'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === 'signin' ? (
                <>
                  <button
                    onClick={() => setMode('reset')}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot your password?
                  </button>
                  <button
                    onClick={() => setMode('magic-link')}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full"
                  >
                    Sign in with magic link
                  </button>
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button onClick={() => setMode('signup')} className="text-primary hover:underline">
                      Create one
                    </button>
                  </div>
                  <div className="pt-4 border-t">
                    <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      Admin Portal
                    </Link>
                  </div>
                </>
              ) : mode === 'signup' ? (
                <div className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button onClick={() => setMode('signin')} className="text-primary hover:underline">
                    Sign in
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setMode('signin')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}