import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import { useAuthenticatedCustomerData } from '@/hooks/useAuthenticatedCustomerData';
import { authService } from '@/services';

const Account = () => {
  const navigate = useNavigate();
  const { profile, loading, error } = useAuthenticatedCustomerData();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const session = await authService.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading account information...</p>
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
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                Unable to load account information. Please check your access credentials.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/customer-portal')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customer Portal
          </Button>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your basic account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-lg font-medium">{profile.first_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-lg font-medium">{profile.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-medium">{profile.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg font-medium">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your account verification and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Authentication Status</label>
                  <div className="mt-1">
                    <Badge variant={profile.is_authenticated ? 'default' : 'secondary'}>
                      {profile.is_authenticated ? 'Verified' : 'Pending Verification'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {profile.permissions || 'Customer'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trust Entity</label>
                  <div className="mt-1">
                    <Badge variant={profile.is_trust_entity ? 'default' : 'secondary'}>
                      {profile.is_trust_entity ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Updates Agreement</label>
                  <div className="mt-1">
                    <Badge variant={profile.agree_to_updates ? 'default' : 'secondary'}>
                      {profile.agree_to_updates ? 'Agreed' : 'Not Agreed'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mailing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mailing Address
              </CardTitle>
              <CardDescription>Where we send important documents and notices</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.mailing_address ? (
                <div className="space-y-2">
                  <p className="font-medium">{profile.mailing_address}</p>
                  {profile.mailing_address_2 && <p>{profile.mailing_address_2}</p>}
                  <p>
                    {profile.mailing_city}, {profile.mailing_state} {profile.mailing_zip}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No mailing address on file</p>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Lifetime Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${profile.lifetime_savings.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total amount saved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Referral Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${profile.referral_credit_balance || 0}
                </div>
                <p className="text-sm text-muted-foreground">Available credits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Member Since</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Date(profile.created_at).getFullYear()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Code */}
          {profile.referral_code && (
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Code</CardTitle>
                <CardDescription>Share this code with friends to earn rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-lg font-mono font-bold p-3 bg-muted rounded-lg">
                      {profile.referral_code}
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.referral_code!);
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">?</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">Demo Account</h3>
                <p className="text-sm text-muted-foreground">
                  This is a demonstration account with mock data. In the real application, 
                  you would be able to edit these fields and update your preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;