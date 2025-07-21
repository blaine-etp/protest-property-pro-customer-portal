
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, Home, User, FileText } from 'lucide-react';

const newCustomerSchema = z.object({
  // Property Information
  address: z.string().min(1, 'Property address is required'),
  parcelNumber: z.string().optional(),
  
  // Owner Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  isTrustEntity: z.boolean(),
  entityName: z.string().optional(),
  relationshipToEntity: z.string().optional(),
  entityType: z.enum(['LLC', 'Corporation', 'Partnership', 'Estate', 'Trust', 'Other']).optional(),
  role: z.enum(['homeowner', 'property_manager', 'authorized_person']),
  
  // Contact Information
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  
  // Preferences
  agreeToUpdates: z.boolean(),
  includeAllProperties: z.boolean(),
}).refine((data) => {
  if (data.isTrustEntity && !data.entityName) {
    return false;
  }
  if (data.isTrustEntity && !data.entityType) {
    return false;
  }
  return true;
}, {
  message: "Entity name and type are required when representing a trust/entity",
  path: ["entityName"],
}).refine((data) => {
  if (data.isTrustEntity && !data.entityType) {
    return false;
  }
  return true;
}, {
  message: "Entity type is required when representing a trust/entity",
  path: ["entityType"],
});

type NewCustomerFormData = z.infer<typeof newCustomerSchema>;

interface NewCustomerFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const NewCustomerForm: React.FC<NewCustomerFormProps> = ({ onBack, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    legalOwnerName: string;
    parcelNumber: string;
  } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewCustomerFormData>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      address: '',
      parcelNumber: '',
      firstName: '',
      lastName: '',
      isTrustEntity: false,
      entityName: '',
      relationshipToEntity: '',
      role: 'homeowner',
      email: '',
      phone: '',
      agreeToUpdates: true,
      includeAllProperties: false,
    },
  });

  const isTrustEntity = form.watch('isTrustEntity');

  const handleAddressLookup = async (address: string) => {
    if (!address || address.length < 5) {
      setVerificationData(null);
      return;
    }

    setIsLookingUp(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock property verification data
      setVerificationData({
        legalOwnerName: "Smith Family Trust",
        parcelNumber: "1234567890"
      });
    } catch (error) {
      console.error('Property lookup error:', error);
      setVerificationData(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  const onSubmit = async (values: NewCustomerFormData) => {
    setIsSubmitting(true);
    
    try {
      // Check if email already exists
      const { data: existingProfiles, error: profileCheckError } = await supabase
        .from('profiles')
        .select('email, is_authenticated')
        .eq('email', values.email);

      if (profileCheckError) {
        throw new Error('Failed to check existing profiles');
      }

      if (existingProfiles && existingProfiles.length > 0) {
        const existingProfile = existingProfiles[0];
        if (existingProfile.is_authenticated) {
          toast({
            title: "Email Already Registered",
            description: "This email is already registered. Please use a different email or search for the existing customer.",
            variant: "destructive",
          });
          return;
        } else {
          toast({
            title: "Application Already Submitted",
            description: "An application with this email already exists. Documents will be regenerated and sent.",
            variant: "default",
          });
        }
      }

      // Create Supabase user with temporary password
      const tempPassword = `temp_${crypto.randomUUID()}`;
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: tempPassword,
        options: {
          emailRedirectTo: undefined,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          }
        }
      });

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!authUser?.user?.id) {
        throw new Error('Failed to create user account');
      }

      const userId = authUser.user.id;

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
          role: values.role,
          agree_to_updates: values.agreeToUpdates,
          is_trust_entity: values.isTrustEntity,
        }])
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation error: ${profileError.message}`);
      }

      // Create owner record
      const getOwnerType = () => {
        if (!values.isTrustEntity) {
          return 'individual';
        }
        // Map entity type to lowercase database values
        const typeMap: Record<string, string> = {
          'LLC': 'llc',
          'Corporation': 'corporation',
          'Partnership': 'partnership',
          'Estate': 'estate',
          'Trust': 'trust',
          'Other': 'other'
        };
        return typeMap[values.entityType!] || 'other';
      };

      const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .insert([{
          name: values.isTrustEntity ? values.entityName : `${values.firstName} ${values.lastName}`,
          owner_type: getOwnerType(),
          form_entity_type: values.isTrustEntity ? values.entityType : null,
          form_entity_name: values.isTrustEntity ? values.entityName : null,
          entity_relationship: values.isTrustEntity ? values.relationshipToEntity : null,
          created_by_user_id: userId,
        }])
        .select()
        .single();

      if (ownerError) {
        throw new Error(`Owner creation error: ${ownerError.message}`);
      }

      // Create property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert([{
          user_id: userId,
          address: values.address,
          parcel_number: values.parcelNumber || null,
          include_all_properties: values.includeAllProperties,
          owner_id: owner.id,
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
          user_id: userId,
          property_id: property.id,
          status: 'submitted',
        }])
        .select()
        .single();

      if (applicationError) {
        throw new Error(`Application creation error: ${applicationError.message}`);
      }

      // Generate and send documents
      const [form50162Response, servicesAgreementResponse] = await Promise.all([
        supabase.functions.invoke('generate-form-50-162', {
          body: { userId, propertyId: property.id }
        }),
        supabase.functions.invoke('generate-services-agreement', {
          body: { userId, propertyId: property.id }
        })
      ]);

      if (form50162Response.error) {
        console.error('Form 50-162 generation error:', form50162Response.error);
      }

      if (servicesAgreementResponse.error) {
        console.error('Services agreement generation error:', servicesAgreementResponse.error);
      }

      // Sign out the temporary user session
      await supabase.auth.signOut();

      toast({
        title: "Customer Onboarded Successfully",
        description: `${values.firstName} ${values.lastName} has been onboarded. Documents have been generated and will be sent to ${values.email} for signature.`,
      });

      onSuccess();

    } catch (error: any) {
      console.error('Concierge onboarding error:', error);
      toast({
        title: "Onboarding Failed",
        description: error.message || "An error occurred during customer onboarding. Please try again.",
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
          <h2 className="text-2xl font-bold text-slate-900">New Customer Onboarding</h2>
          <p className="text-slate-600 mt-1">
            Complete the full onboarding process for a new customer.
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Selection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <CardDescription>
            Collect customer details for document generation and signature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Property Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Property Information</h3>
                </div>
                
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

                  {/* Property Verification Section */}
                  {(isLookingUp || verificationData) && (
                    <div className="md:col-span-2">
                      <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-blue-900">
                            Property Verification
                          </CardTitle>
                          <CardDescription className="text-blue-700">
                            Please verify these details with the customer
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLookingUp ? (
                            <div className="flex items-center gap-2 text-blue-800">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              Looking up property information...
                            </div>
                          ) : verificationData ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-blue-900">Legal Owner Name</label>
                                  <p className="text-blue-800 font-medium">{verificationData.legalOwnerName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-blue-900">Parcel Number</label>
                                  <p className="text-blue-800 font-medium">{verificationData.parcelNumber}</p>
                                </div>
                              </div>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                                <p className="text-sm text-yellow-800">
                                  ⚠️ Please confirm these details match what the customer expects before proceeding.
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  
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
              </div>

              <Separator />

              {/* Owner Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Owner Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="isTrustEntity"
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
                          I am representing a trust, LLC, or other entity
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter first name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter last name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isTrustEntity && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="entityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entity Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter entity name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="entityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entity Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select entity type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LLC">LLC</SelectItem>
                              <SelectItem value="Corporation">Corporation</SelectItem>
                              <SelectItem value="Partnership">Partnership</SelectItem>
                              <SelectItem value="Estate">Estate</SelectItem>
                              <SelectItem value="Trust">Trust</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="relationshipToEntity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Relationship to Entity</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Trustee, Manager, Officer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="homeowner">Homeowner</SelectItem>
                          <SelectItem value="property_manager">Property Manager</SelectItem>
                          <SelectItem value="authorized_person">Authorized Person</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="customer@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(555) 123-4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="text-lg font-semibold">Preferences</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="agreeToUpdates"
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
                          Customer agrees to receive property tax updates and notifications via email and text
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

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
                  {isSubmitting ? 'Processing...' : 'Generate & Send Documents'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
