import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  ChevronDown,
  Plus,
  Building,
  User,
  LogOut,
  Loader2,
  ExternalLink,
  MoreVertical,
  DollarSign
} from 'lucide-react';
import { useAuthenticatedCustomerData } from '@/hooks/useAuthenticatedCustomerData';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services';
import DocumentsSection from '@/components/DocumentsSection';
import { EvidenceSection } from '@/components/evidence/EvidenceSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CustomerPortal = () => {

  //debug line
  console.log('🔍 Auth service being used:', authService.constructor.name);
  console.log('🔍 Auth service type:', typeof authService.getSession);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, properties, loading, error, toggleAutoAppeal } = useAuthenticatedCustomerData();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      // If we have session tokens in URL, give App.tsx time to process them
      const urlParams = new URLSearchParams(window.location.search);
      const hasTokens = urlParams.get('access_token') && urlParams.get('refresh_token');
      
      if (hasTokens) {
        // Wait a moment for App.tsx to process the tokens
        setTimeout(async () => {
          const session = await authService.getSession();
          if (!session) {
            navigate('/auth');
          }
        }, 500);
      } else {
        // No tokens, check immediately
        const session = await authService.getSession();
        if (!session) {
          navigate('/auth');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Check if user needs to set password
    const checkPasswordStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.needs_password_setup) {
          setShowPasswordPrompt(true);
        }
      } catch (error) {
        console.log('Error checking password status:', error);
      }
    };
    
    checkPasswordStatus();
  }, []);

  const handleAccountAction = async (action: string) => {
    if (action === "account") {
      navigate('/account');
    } else if (action === "add-property") {
      navigate('/add-property');
    } else if (action === "billing") {
      navigate('/billing');
    } else if (action === "documents") {
      navigate('/documents');
    } else if (action === "refer-friend") {
      navigate('/refer-friend');
    } else if (action === "logout") {
      try {
        await authService.signOut();
        navigate('/auth');
      } catch (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Sign Out Error",
          description: "There was an error signing out. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.log(`Account action: ${action}`);
    }
  };

  const handleSetPassword = () => {
    navigate('/set-password');
    setShowPasswordPrompt(false);
  };

  const handleDismissPasswordPrompt = () => {
    setShowPasswordPrompt(false);
    // Optionally set a flag to remind later
    localStorage.setItem('password-prompt-dismissed', Date.now().toString());
  };

  const handleToggleAutoAppeal = async (propertyId: string) => {
    try {
      await toggleAutoAppeal(propertyId);
      toast({
        title: "Auto-Appeal Updated",
        description: "Auto-appeal setting has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update auto-appeal setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const activateAutoAppeal = (propertyId: string) => {
    handleToggleAutoAppeal(propertyId);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your property data...</span>
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
              <h2 className="text-xl font-bold">No Data Found</h2>
              <p className="text-muted-foreground">
                {error || "No customer data found for this email address."}
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Customer Portal</h1>
              <p className="text-muted-foreground">Welcome back, {profile.first_name}!</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Lifetime Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${profile.lifetime_savings.toLocaleString()}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {profile.first_name} {profile.last_name}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleAccountAction('account')}>
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('add-property')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('billing')}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('documents')}>
                    <Building className="h-4 w-4 mr-2" />
                    All Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('refer-friend')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Refer-a-Friend
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('logout')}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* ADD PASSWORD PROMPT BANNER HERE (after header, before main content) */}
      {showPasswordPrompt && (
        <Alert className="mx-4 mt-4 border-yellow-200 bg-yellow-50">
          <Shield className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-yellow-800">
              🔒 <strong>Secure your account:</strong> Set a password to protect your property data.
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSetPassword}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Set Password
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismissPasswordPrompt}
                className="text-yellow-700 hover:bg-yellow-100"
              >
                Later
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">All Properties</h2>
              <p className="text-muted-foreground">Properties ({properties.length})</p>
            </div>
            <Button onClick={() => handleAccountAction('add-property')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Property
            </Button>
          </div>

          <div className="space-y-4">
            {properties.map((property) => {
              console.log('Rendering property:', property);
              return (
                <Card key={property.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Property Image - Fixed Container */}
                      <div 
                        className="w-32 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 border"
                        style={{ 
                          minWidth: '8rem', 
                          maxWidth: '8rem', 
                          minHeight: '6rem', 
                          maxHeight: '6rem' 
                        }}
                      >
                        <img 
                          src="/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png" 
                          alt={`Property at ${property.address}`}
                          className="w-full h-full object-cover"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            maxWidth: '8rem', 
                            maxHeight: '6rem' 
                          }}
                        />
                      </div>
                      
                      {/* Property Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{property.address || 'No address available'}</h3>
                            <p className="text-sm text-muted-foreground">Austin, TX</p>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-blue-600 text-sm"
                              onClick={() => handleViewProperty(property.id)}
                            >
                              View Property <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Property</DropdownMenuItem>
                              <DropdownMenuItem>Remove Property</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Property Taxes Section */}
                        <div className="pt-4">
                          <Collapsible defaultOpen={properties.length === 1}>
                            <div className="flex items-center justify-between py-2 border-t">
                              <h4 className="font-medium">Property Details</h4>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                            
                            <CollapsibleContent className="space-y-4">
                              {/* Appeal Section */}
                              <Collapsible defaultOpen>
                                <div className="space-y-3">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                                      <span className="font-medium">Appeal</span>
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">CURRENT STATUS</div>
                                        <div className="mt-1">
                                          <Badge variant={property.appeal_status?.appeal_status === 'filed' ? 'default' : 'secondary'}>
                                            {property.appeal_status?.appeal_status || 'Pending'}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">AUTO-APPEAL</div>
                                        <div className="mt-1">
                                          <Badge variant={property.appeal_status?.auto_appeal_enabled ? 'default' : 'secondary'}>
                                            {property.appeal_status?.auto_appeal_enabled ? 'Active' : 'Inactive'}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">CONTINGENCY FEE</div>
                                        <div className="mt-1">
                                          25%
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {!property.appeal_status?.auto_appeal_enabled && (
                                      <div className="flex justify-end">
                                        <Button
                                          onClick={() => activateAutoAppeal(property.id)}
                                          className="bg-blue-600 hover:bg-blue-700"
                                        >
                                          Activate Auto-Appeal
                                        </Button>
                                      </div>
                                    )}
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                              
                               {/* Exemptions Section */}
                              <Collapsible>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                                    <span className="font-medium">Exemptions</span>
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent className="pt-3">
                                  <div className="text-sm text-muted-foreground">
                                    No exemptions currently active for this property.
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>

                              {/* Evidence Section */}
                              <Collapsible>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                                    <span className="font-medium">Evidence</span>
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent className="pt-3">
                                  <EvidenceSection propertyId={property.id} />
                                </CollapsibleContent>
                              </Collapsible>

                              {/* Documents Section */}
                              <Collapsible>
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                                    <span className="font-medium">Documents</span>
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent className="pt-3">
                                  <DocumentsSection propertyId={property.id} />
                                </CollapsibleContent>
                              </Collapsible>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerPortal;
