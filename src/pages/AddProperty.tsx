import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Home, Plus } from 'lucide-react';
import { useAuthenticatedCustomerData } from '@/hooks/useAuthenticatedCustomerData';
import { authService } from '@/services';
import { AddPropertyForm } from '@/components/AddPropertyForm';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Address validation schema
const addressSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

const AddProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentAddress, setCurrentAddress] = useState('');
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  // Use authenticated customer data
  const { profile, loading, error } = useAuthenticatedCustomerData();

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: ''
    }
  });

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

  const handleAddressSubmit = (values: z.infer<typeof addressSchema>) => {
    setCurrentAddress(values.address);
    setShowPropertyForm(true);
  };

  const handleBackToPortal = () => {
    navigate('/customer-portal');
  };

  const handleFormComplete = () => {
    toast({
      title: "Property Added",
      description: "Your property has been successfully added to your account.",
    });
    navigate('/customer-portal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading customer data...</p>
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
              <h2 className="text-xl font-bold">Customer Profile Not Found</h2>
              <p className="text-muted-foreground">
                We couldn't find your customer profile. Please contact support.
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

  // Show AddPropertyForm if address is submitted
  if (showPropertyForm && currentAddress) {
    return (
      <AddPropertyForm
        currentAddress={currentAddress}
        existingProfile={profile}
        onComplete={handleFormComplete}
        onBack={() => setShowPropertyForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToPortal}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customer Portal
          </Button>
          <h1 className="text-3xl font-bold">Add New Property</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile.first_name}! Add another property to your account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Address
            </CardTitle>
            <CardDescription>
              Enter the address of the property you'd like to add to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddressSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter full property address (e.g., 123 Main St, Austin, TX 78701)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Continue with This Address
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">?</span>
            </div>
            <div>
              <h3 className="font-medium mb-1">Demo Note</h3>
              <p className="text-sm text-muted-foreground">
                This is a demonstration version. In the real application, we would verify 
                property ownership and connect to county tax databases for accurate information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;