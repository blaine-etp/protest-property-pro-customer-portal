
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Home, User, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const addPropertySchema = z.object({
  address: z.string().min(1, 'Property address is required'),
  parcelNumber: z.string().optional(),
  includeAllProperties: z.boolean(),
});

type AddPropertyFormData = z.infer<typeof addPropertySchema>;

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

interface AddPropertyFormProps {
  customer: Customer;
  onBack: () => void;
  onSuccess: () => void;
}

interface PropertyVerificationData {
  legalOwnerName: string;
  parcelNumber: string;
  address: string;
}

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ 
  customer, 
  onBack, 
  onSuccess 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState<PropertyVerificationData | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      address: '',
      parcelNumber: '',
      includeAllProperties: false,
    },
  });

  // Mock property lookup function - simulates API call to property records
  const handleAddressLookup = async (address: string) => {
    if (!address || address.length < 10) {
      setVerificationData(null);
      return;
    }

    setIsLookingUp(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock property data based on address
    const mockPropertyData: PropertyVerificationData = {
      legalOwnerName: address.includes('Main') ? 'Smith Family Trust' : 
                     address.includes('Oak') ? 'Johnson, Robert & Mary' :
                     address.includes('Elm') ? 'ABC Properties LLC' :
                     'Williams, John Michael',
      parcelNumber: `PAR-${Math.floor(Math.random() * 900000) + 100000}`,
      address: address
    };
    
    setVerificationData(mockPropertyData);
    setIsLookingUp(false);
  };

  const onSubmit = async (values: AddPropertyFormData) => {
    setIsSubmitting(true);
    
    try {
      // Get the existing owner for this customer
      const { data: existingOwners, error: ownersError } = await supabase
        .from('owners')
        .select('id')
        .eq('created_by_user_id', customer.user_id)
        .limit(1);

      if (ownersError) {
        throw new Error(`Error finding customer owner: ${ownersError.message}`);
      }

      let ownerId: string;

      if (existingOwners && existingOwners.length > 0) {
        ownerId = existingOwners[0].id;
      } else {
        // Create owner record if none exists
        const { data: owner, error: ownerError } = await supabase
          .from('owners')
          .insert([{
            name: `${customer.first_name} ${customer.last_name}`,
            owner_type: 'individual',
            created_by_user_id: customer.user_id,
          }])
          .select()
          .single();

        if (ownerError) {
          throw new Error(`Owner creation error: ${ownerError.message}`);
        }

        ownerId = owner.id;
      }

      // Create property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert([{
          user_id: customer.user_id,
          address: values.address,
          parcel_number: values.parcelNumber || null,
          include_all_properties: values.includeAllProperties,
          owner_id: ownerId,
        }])
        .select()
        .single();

      if (propertyError) {
        throw new Error(`Property creation error: ${propertyError.message}`);
      }

      // Create application record
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert([{
          user_id: customer.user_id,
          property_id: property.id,
          status: 'submitted',
        }])
        .select()
        .single();

      if (applicationError) {
        throw new Error(`Application creation error: ${applicationError.message}`);
      }

      // Generate documents
      const [form50162Response, servicesAgreementResponse] = await Promise.all([
        supabase.functions.invoke('generate-form-50-162', {
          body: { userId: customer.user_id, propertyId: property.id }
        }),
        supabase.functions.invoke('generate-services-agreement', {
          body: { userId: customer.user_id, propertyId: property.id }
        })
      ]);

      if (form50162Response.error) {
        console.error('Form 50-162 generation error:', form50162Response.error);
      }

      if (servicesAgreementResponse.error) {
        console.error('Services agreement generation error:', servicesAgreementResponse.error);
      }

      toast({
        title: "Property Added Successfully",
        description: `New property added for ${customer.first_name} ${customer.last_name}. Documents have been generated and will be sent to ${customer.email}.`,
      });

      onSuccess();

    } catch (error: any) {
      console.error('Add property error:', error);
      toast({
        title: "Failed to Add Property",
        description: error.message || "An error occurred while adding the property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Add New Property</h2>
          <p className="text-slate-600 mt-1">
            Adding a property for {customer.first_name} {customer.last_name}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Search
        </Button>
      </div>

      {/* Customer Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <User className="h-5 w-5" />
            Selected Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-900">Name:</span>
              <p className="text-blue-800">{customer.first_name} {customer.last_name}</p>
            </div>
            <div>
              <span className="font-medium text-blue-900">Email:</span>
              <p className="text-blue-800">{customer.email}</p>
            </div>
            <div>
              <span className="font-medium text-blue-900">Existing Properties:</span>
              <p className="text-blue-800">{customer.property_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Information
          </CardTitle>
          <CardDescription>
            Enter the details for the new property to be added to this customer's account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Property Address *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter property address"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleAddressLookup(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="parcelNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcel Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter parcel number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Property Verification Section */}
              {(isLookingUp || verificationData) && (
                <div className="space-y-4">
                  <Separator />
                  
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="h-5 w-5" />
                        Property Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLookingUp ? (
                        <div className="flex items-center gap-3 text-yellow-700">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Looking up property information...</span>
                        </div>
                      ) : verificationData ? (
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-yellow-200">
                            <h4 className="font-semibold text-yellow-800 mb-3">Property Records Found:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-yellow-800">Legal Owner Name:</span>
                                <p className="text-yellow-700 font-semibold">{verificationData.legalOwnerName}</p>
                              </div>
                              <div>
                                <span className="font-medium text-yellow-800">Parcel Number:</span>
                                <p className="text-yellow-700 font-semibold">{verificationData.parcelNumber}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-yellow-800">Please verify with customer:</p>
                                <p className="text-yellow-700 text-sm mt-1">
                                  Confirm that the legal owner name matches the customer's information and that the parcel number is correct before proceeding.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Property Options</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="includeAllProperties"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm leading-relaxed">
                          Include all properties listed under this address
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding Property...' : 'Add Property & Generate Documents'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
