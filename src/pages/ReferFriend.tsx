import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Share, Users, Gift, Mail, DollarSign } from "lucide-react";
import { useAuthenticatedCustomerData } from "@/hooks/useAuthenticatedCustomerData";
import { authService } from "@/services";

interface Profile {
  first_name: string;
  last_name: string;
  user_id: string;
  email: string;
}


const ReferFriend = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [friendEmail, setFriendEmail] = useState("");
  const [friendName, setFriendName] = useState("");

  // Use authenticated customer data
  const { profile, loading, error } = useAuthenticatedCustomerData();
  
  // Mock referral data for demo
  const mockReferrals = [
    {
      id: '1',
      referee_first_name: 'John',
      referee_last_name: 'Doe',
      referee_email: 'john.doe@example.com',
      signup_date: '2024-01-15',
      status: 'completed',
      credit_awarded_amount: 25
    },
    {
      id: '2',
      referee_first_name: 'Jane',
      referee_last_name: 'Smith',
      referee_email: 'jane.smith@example.com',
      signup_date: '2024-02-20',
      status: 'pending',
      credit_awarded_amount: 0
    }
  ];
  
  const creditBalance = 50; // Mock credit balance for demo
  const referralCode = 'REF123456'; // Mock referral code for demo

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

  const handleSendInvite = async () => {
    if (!friendEmail || !friendName) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and email for your friend.",
        variant: "destructive",
      });
      return;
    }

    // Mock invite sending for demo
    toast({
      title: "Invite Sent!",
      description: `Demo: Referral invite sent to ${friendName} at ${friendEmail}`,
    });
    
    setFriendEmail("");
    setFriendName("");
  };

  const handleCopyReferralLink = () => {
    const referralLink = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading refer-a-friend information...</p>
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
                Unable to load refer-a-friend page. Please check your access credentials.
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
          <h1 className="text-3xl font-bold">Refer-a-Friend</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile?.first_name}! Share Easy Tax Protest with friends and earn rewards.
          </p>
        </div>

        <div className="space-y-6">
          {/* Referral Program Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Referral Program
              </CardTitle>
              <CardDescription>Earn rewards for every friend you refer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    <Share className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium">Share Your Link</p>
                  <p className="text-sm text-muted-foreground">Send your unique referral link to friends</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-medium">They Sign Up</p>
                  <p className="text-sm text-muted-foreground">Your friend creates an account and uses our service</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                    <Gift className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="font-medium">You Both Earn</p>
                  <p className="text-sm text-muted-foreground">$25 credit for you, $50 credit for them</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send Invite */}
          <Card>
            <CardHeader>
              <CardTitle>Send Invitation</CardTitle>
              <CardDescription>Invite friends directly via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="friendName">Friend's Name</Label>
                  <Input
                    id="friendName"
                    placeholder="Enter friend's name"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="friendEmail">Friend's Email</Label>
                  <Input
                    id="friendEmail"
                    type="email"
                    placeholder="Enter friend's email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSendInvite} className="w-full md:w-auto">
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>

          {/* Share Referral Link */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>Share this link directly with friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/?ref=${referralCode}`}
                  className="flex-1"
                />
                <Button onClick={handleCopyReferralLink} variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>Track your referral progress and earned credits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {referral.referee_first_name && referral.referee_last_name 
                            ? `${referral.referee_first_name} ${referral.referee_last_name}` 
                            : referral.referee_email}
                        </p>
                        <p className="text-sm text-muted-foreground">{referral.referee_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Referred: {new Date(referral.signup_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold">${referral.credit_awarded_amount || 0}</p>
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              </div>
              
              {mockReferrals.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No referrals yet</h3>
                  <p className="text-muted-foreground">
                    Start sharing your referral link to earn rewards!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credit Balance and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Credit Balance
                </CardTitle>
                <CardDescription>Your available referral credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">${creditBalance}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Available for future invoices
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Referral Statistics</CardTitle>
                <CardDescription>Your referral program performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="text-2xl font-bold">{mockReferrals.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {mockReferrals.filter(r => r.status === 'completed').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      {mockReferrals.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${mockReferrals.reduce((sum, r) => sum + (r.credit_awarded_amount || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferFriend;