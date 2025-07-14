import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Share, Users, Gift, Mail } from "lucide-react";
import { useCustomerData } from "@/hooks/useCustomerData";
import { useTokenCustomerData } from "@/hooks/useTokenCustomerData";

interface Profile {
  first_name: string;
  last_name: string;
  user_id: string;
  email: string;
}

// Dummy referral data for demonstration
const dummyReferrals = [
  {
    id: "ref-001",
    name: "John Smith",
    email: "john.smith@email.com",
    status: "signed_up",
    date: "2024-06-10",
    reward: "$50"
  },
  {
    id: "ref-002", 
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    status: "pending",
    date: "2024-06-05",
    reward: "$50"
  }
];

const ReferFriend = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friendEmail, setFriendEmail] = useState("");
  const [friendName, setFriendName] = useState("");

  // Get URL parameters for token-based access
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  // Use appropriate data hook based on access method
  const tokenData = useTokenCustomerData(token || '');
  const emailData = useCustomerData(email || '');
  
  // Determine which data source to use
  const customerData = token ? tokenData : emailData;
  const { profile: customerProfile, loading: customerLoading, error: customerError } = customerData;

  useEffect(() => {
    if (token || email) {
      // Use token/email based access - profile data comes from customerData
      if (customerProfile && !customerLoading) {
        setProfile({
          first_name: customerProfile.first_name || '',
          last_name: customerProfile.last_name || '',
          user_id: customerProfile.user_id,
          email: customerProfile.email || '',
        });
      }
    }
  }, [customerProfile, customerLoading, token, email]);

  const handleSendInvite = () => {
    if (!friendEmail || !friendName) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and email for your friend.",
        variant: "destructive",
      });
      return;
    }

    // Demo functionality - in real app would send actual invite
    toast({
      title: "Invite Sent! (Demo)",
      description: `Demo invite sent to ${friendName} at ${friendEmail}`,
    });
    
    setFriendEmail("");
    setFriendName("");
  };

  const handleCopyReferralLink = () => {
    const demoLink = `https://easytaxprotest.com/signup?ref=${profile?.user_id}`;
    navigator.clipboard.writeText(demoLink);
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed_up':
        return <Badge variant="default">Signed Up</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (customerLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading refer-a-friend information...</p>
        </div>
      </div>
    );
  }

  if (customerError || !customerProfile) {
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
            onClick={() => {
              const params = new URLSearchParams();
              if (email) params.set('email', email);
              if (token) params.set('token', token);
              const queryString = params.toString();
              navigate(`/customer-portal${queryString ? `?${queryString}` : ''}`);
            }}
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
                  <p className="text-sm text-muted-foreground">$50 credit for you, $25 discount for them</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send Invite */}
          <Card>
            <CardHeader>
              <CardTitle>Send Invitation</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                  ⚠️ DEMO - This invitation system is not yet functional
                </span>
              </CardDescription>
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
                  value={`https://easytaxprotest.com/signup?ref=${profile?.user_id}`}
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
              <CardDescription>
                <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                  ⚠️ DEMO DATA - Example referrals for demonstration
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dummyReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.name}</p>
                        <p className="text-sm text-muted-foreground">{referral.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Referred: {new Date(referral.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold">{referral.reward}</p>
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              </div>
              
              {dummyReferrals.length === 0 && (
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

          {/* Referral Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Statistics</CardTitle>
              <CardDescription>Your referral program performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{dummyReferrals.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold">
                    {dummyReferrals.filter(r => r.status === 'signed_up').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {dummyReferrals.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${dummyReferrals.filter(r => r.status === 'signed_up').length * 50}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferFriend;