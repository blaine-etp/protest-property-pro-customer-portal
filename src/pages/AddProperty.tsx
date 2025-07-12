import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useTokenCustomerData } from '@/hooks/useTokenCustomerData';
import AddPropertyForm from '@/components/AddPropertyForm';

const addressSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

const AddProperty = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [currentAddress, setCurrentAddress] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Use different hooks based on whether we have a token or email
  const emailData = useCustomerData(email);
  const tokenData = useTokenCustomerData(token);
  
  // Determine which data source to use
  const isTokenAccess = Boolean(token);
  const { profile, properties, loading, error } = isTokenAccess ? tokenData : emailData;

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: '',
    },
  });

  const handleAddressSubmit = (values: z.infer<typeof addressSchema>) => {
    setCurrentAddress(values.address);
    setShowForm(true);
  };

  const handleBackToPortal = () => {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (token) params.set('token', token);
    const queryString = params.toString();
    navigate(`/customer-portal${queryString ? `?${queryString}` : ''}`);
  };

  const handleFormComplete = () => {
    // Navigate back to customer portal with success
    handleBackToPortal();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your account data...</span>
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
              <h2 className="text-xl font-bold">Account Not Found</h2>
              <p className="text-muted-foreground">
                {error || "No customer account found."}
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

  if (showForm) {
    return (
      <AddPropertyForm
        address={currentAddress}
        existingProfile={profile}
        onComplete={handleFormComplete}
        onBack={() => setShowForm(false)}
      />
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
              onClick={handleBackToPortal}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Property</h1>
              <p className="text-muted-foreground">Add another property to your account</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Property Address</CardTitle>
              <p className="text-center text-muted-foreground">
                Enter the address of the property you'd like to add
              </p>
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
                            placeholder="123 Main St, Austin, TX"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" variant="accent">
                    Continue
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddProperty;