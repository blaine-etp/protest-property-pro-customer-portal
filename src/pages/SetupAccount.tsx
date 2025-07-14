import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const SetupAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No token provided');
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('authentication_token', token)
        .gt('token_expires_at', new Date().toISOString())
        .eq('is_authenticated', false)
        .single();

      if (profileError || !profileData) {
        throw new Error('Invalid, expired, or already used token');
      }

      setProfile(profileData);
    } catch (err: any) {
      console.error('Token verification error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupAccount = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    try {
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: profile.email,
        password: password,
        options: {
          data: {
            first_name: profile.first_name,
            last_name: profile.last_name,
          }
        }
      });

      if (authError) {
        throw new Error(`Account creation failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Update the profile to link it to the auth user and mark as authenticated
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_id: authData.user.id,
          is_authenticated: true,
          authentication_token: null, // Clear the token since it's no longer needed
        })
        .eq('authentication_token', token);

      if (updateError) {
        throw new Error(`Failed to link account: ${updateError.message}`);
      }

      // Update all related records to use the new auth user ID
      await supabase
        .from('properties')
        .update({ user_id: authData.user.id })
        .eq('user_id', profile.user_id);

      await supabase
        .from('applications')
        .update({ user_id: authData.user.id })
        .eq('user_id', profile.user_id);

      // Check if user was referred via referral code and create relationship
      const referralCode = searchParams.get('ref');
      if (referralCode) {
        try {
          // Find the referrer by referral code
          const { data: referrerProfile, error: referrerError } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name')
            .eq('referral_code', referralCode)
            .single();

          if (referrerProfile && !referrerError) {
            // Create referral relationship
            const { error: referralError } = await supabase
              .from('referral_relationships')
              .insert({
                referrer_id: referrerProfile.user_id,
                referee_id: authData.user.id,
                referee_email: profile.email,
                referee_first_name: profile.first_name,
                referee_last_name: profile.last_name,
                referral_code: referralCode,
                status: 'completed',
                signup_date: new Date().toISOString(),
              });

            if (referralError) {
              console.error('Failed to create referral relationship:', referralError);
            } else {
              console.log('Referral relationship created successfully');
            }
          }
        } catch (referralErr) {
          console.error('Error processing referral:', referralErr);
          // Don't fail the signup if referral processing fails
        }
      }

      toast({
        title: "Account Created Successfully!",
        description: "Your account has been set up. You can now log in anytime.",
      });

      // Sign the user in and redirect to customer portal
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: password,
      });

      if (signInError) {
        console.error('Auto sign-in failed:', signInError);
        // Redirect to login page if auto sign-in fails
        navigate(`/auth?email=${profile.email}`);
      } else {
        // Redirect to customer portal using email (now that they're authenticated)
        navigate(`/customer-portal?email=${profile.email}`);
      }
    } catch (err: any) {
      console.error('Account setup error:', err);
      toast({
        title: "Setup Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verifying your link...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold">Invalid Link</h2>
              <p className="text-muted-foreground">
                {error || "This setup link is invalid, expired, or has already been used."}
              </p>
              <Button onClick={() => navigate('/')}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">Set Up Your Account</CardTitle>
          <p className="text-muted-foreground">
            Welcome {profile.first_name}! Create a password to access your customer portal anytime.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSetupAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !password || !confirmPassword}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Setting up account...</span>
                </div>
              ) : (
                'Create Account & Access Portal'
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Your Submission Summary:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Phone:</strong> {profile.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAccount;