import React from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  ChevronDown,
  Home,
  MapPin,
  DollarSign,
  Settings,
  Plus,
  ToggleLeft,
  ToggleRight,
  Building,
  User,
  LogOut,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useToast } from '@/hooks/use-toast';

const CustomerPortal = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { toast } = useToast();
  
  const { profile, properties, loading, error, toggleAutoAppeal } = useCustomerData(email);

  const handleAccountAction = (action: string) => {
    console.log(`Account action: ${action}`);
    // TODO: Implement account actions
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
                  <DropdownMenuItem onClick={() => handleAccountAction('settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAccountAction('logout')}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Properties</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Another Property
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="w-full h-48 bg-muted rounded-lg mb-4 overflow-hidden">
                    <img 
                      src="/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png" 
                      alt={`Property at ${property.address}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="leading-tight">{property.address}</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Appeal Status:</span>
                      <Badge variant={property.appeal_status?.appeal_status === 'filed' ? 'default' : 'secondary'}>
                        {property.appeal_status?.appeal_status || 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Exemption Status:</span>
                      <Badge variant={property.appeal_status?.exemption_status === 'approved' ? 'default' : 'secondary'}>
                        {property.appeal_status?.exemption_status || 'Pending'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Current Year Savings</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span>Tax Savings:</span>
                        <span className="font-semibold text-green-600">
                          ${(property.appeal_status?.savings_amount || property.estimated_savings || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="appeal-details">
                        <AccordionTrigger className="text-sm">Appeal Details</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            {property.parcel_number && (
                              <div className="flex justify-between">
                                <span>Parcel Number:</span>
                                <span>{property.parcel_number}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Estimated Savings:</span>
                              <span>${property.estimated_savings?.toLocaleString() || 'TBD'}</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="exemptions">
                        <AccordionTrigger className="text-sm">Auto-Appeal Settings</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Auto-Appeal Enabled:</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleAutoAppeal(property.id)}
                                className="p-0 h-auto"
                              >
                                {property.appeal_status?.auto_appeal_enabled ? (
                                  <ToggleRight className="h-6 w-6 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="flex gap-2 pt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Building className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {!property.appeal_status?.auto_appeal_enabled && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => activateAutoAppeal(property.id)}
                          className="flex-1"
                        >
                          Activate Auto-Appeal
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerPortal;