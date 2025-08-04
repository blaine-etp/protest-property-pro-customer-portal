import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AddPropertyForm from '@/components/AddPropertyForm';
import { GooglePlacesAutocomplete, GooglePlacesData } from '@/components/GooglePlacesAutocomplete';
import { supabase } from '@/integrations/supabase/client';

const addressSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

const AddProperty = () => {
  const navigate = useNavigate();
  const [currentAddress, setCurrentAddress] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [googlePlacesData, setGooglePlacesData] = useState<GooglePlacesData | null>(null);
  

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current session from Supabase auth
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.log('No authenticated session found, redirecting to auth');
          navigate('/auth');
          return;
        }

        // Get user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email, phone, is_trust_entity, agree_to_updates, role')
          .eq('user_id', sessionData.session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          navigate('/auth');
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

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
    navigate('/customer-portal');
  };

  const handleFormComplete = () => {
    handleBackToPortal();
  };

  // Handle Google Places data
  const handleGooglePlacesDataChange = (data: GooglePlacesData) => {
    setGooglePlacesData(data);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                Please log in to add a property.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Go to Login
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
        googlePlacesData={googlePlacesData}
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
              <p className="text-muted-foreground">
                Add another property to your account
              </p>
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
                          <GooglePlacesAutocomplete
                            value={field.value}
                            onChange={field.onChange}
                            onPlacesDataChange={handleGooglePlacesDataChange}
                            placeholder="123 Main St, Austin, TX"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
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