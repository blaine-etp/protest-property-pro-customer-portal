
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';
import { useAuthenticatedCustomerData } from '@/hooks/useAuthenticatedCustomerData';
import DocumentsSection from '@/components/DocumentsSection';
import { useToast } from '@/hooks/use-toast';

const PropertyDetail = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { properties, loading, error, toggleAutoAppeal } = useAuthenticatedCustomerData();
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    if (properties.length > 0 && propertyId) {
      const foundProperty = properties.find(p => p.id === propertyId);
      if (foundProperty) {
        setProperty(foundProperty);
      } else {
        toast({
          title: "Property Not Found",
          description: "The requested property could not be found.",
          variant: "destructive",
        });
        navigate('/customer-portal');
      }
    }
  }, [properties, propertyId, navigate, toast]);

  const handleToggleAutoAppeal = async () => {
    if (!property) return;
    
    try {
      await toggleAutoAppeal(property.id);
      // Update local state
      setProperty(prev => ({
        ...prev,
        appeal_status: {
          ...prev.appeal_status,
          auto_appeal_enabled: !prev.appeal_status?.auto_appeal_enabled
        }
      }));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading property details...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Property Not Found</h2>
              <p className="text-muted-foreground">
                The requested property could not be found or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/customer-portal')}>
                Return to Properties
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
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/customer-portal')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Properties</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Property Details</h1>
              <p className="text-muted-foreground">{property.address}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Property Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Image */}
                <div className="space-y-4">
                  <div className="w-full h-48 bg-muted rounded-lg overflow-hidden border">
                    <img 
                      src="/lovable-uploads/9f31b537-92b7-4e7d-9b60-b224c326a0cc.png" 
                      alt={`Property at ${property.address}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Property Information */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-semibold">{property.address}</h3>
                      <p className="text-sm text-muted-foreground">Austin, TX</p>
                    </div>
                  </div>
                  
                  {property.parcel_number && (
                    <div>
                      <span className="text-sm font-medium">Parcel Number: </span>
                      <span className="text-sm text-muted-foreground">{property.parcel_number}</span>
                    </div>
                  )}
                  
                  {property.estimated_savings && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Estimated Savings: </span>
                      <span className="text-sm font-bold text-green-600">
                        ${property.estimated_savings.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appeal Status */}
          <Card>
            <CardHeader>
              <CardTitle>Appeal Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Current Status</div>
                  <Badge variant={property.appeal_status?.appeal_status === 'filed' ? 'default' : 'secondary'}>
                    {property.appeal_status?.appeal_status || 'Pending'}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Auto-Appeal</div>
                  <Badge variant={property.appeal_status?.auto_appeal_enabled ? 'default' : 'secondary'}>
                    {property.appeal_status?.auto_appeal_enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Contingency Fee</div>
                  <span className="font-medium">25%</span>
                </div>
              </div>
              
              {property.appeal_status?.savings_amount > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Savings Achieved: ${property.appeal_status.savings_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                {property.appeal_status?.auto_appeal_enabled ? (
                  <Button 
                    onClick={handleToggleAutoAppeal} 
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Deactivate Auto-Appeal
                  </Button>
                ) : (
                  <Button onClick={handleToggleAutoAppeal} className="bg-blue-600 hover:bg-blue-700">
                    Activate Auto-Appeal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exemptions */}
          <Card>
            <CardHeader>
              <CardTitle>Exemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No exemptions currently active for this property.
              </p>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentsSection propertyId={property.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;
