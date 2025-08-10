import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabaseAuthService } from '@/services/supabaseAuthService';
import AddPropertyForm from '@/components/AddPropertyForm';
import { GooglePlacesAutocomplete, GooglePlacesData } from '@/components/GooglePlacesAutocomplete';

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
  
  // Check URL parameter to enable database mode
  const urlParams = new URLSearchParams(window.location.search);
  const forceDatabaseSave = urlParams.get('database') === 'true';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const sessionResult = await supabaseAuthService.getSession();
        if (sessionResult?.data?.session?.user) {
          const user = sessionResult.data.session.user;
          const { data: dbProfile } = await supabaseAuthService.getProfile(user.id);
          const userData = {
            user_id: user.id,
            first_name: dbProfile?.first_name || '',
            last_name: dbProfile?.last_name || '',
            email: dbProfile?.email || user.email || '',
            phone: dbProfile?.phone || '',
            role: (dbProfile as any)?.role || 'homeowner',
            is_trust_entity: (dbProfile as any)?.is_trust_entity || false,
            agree_to_updates: (dbProfile as any)?.agree_to_updates ?? true
          };
          console.log('👤 Loaded profile for AddProperty', { userId: user.id, hasDbProfile: !!dbProfile });
          setProfile(userData);
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, forceDatabaseSave]);

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
        forceDatabaseSave={forceDatabaseSave}
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
                {forceDatabaseSave && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    Database Mode
                  </span>
                )}
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