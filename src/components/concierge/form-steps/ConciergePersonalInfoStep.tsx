import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { DollarSign, User, FileText, Building, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { ConciergeFormData } from '../AddPropertyMultiStepForm';
import { GooglePlacesAutocomplete, GooglePlacesData } from '@/components/GooglePlacesAutocomplete';

const schema = z.object({
  address: z.string().min(1, 'Property address is required'),
  parcelNumber: z.string().optional(),
  includeAllProperties: z.boolean(),
  isTrustEntity: z.boolean(),
  entityName: z.string().optional(),
  relationshipToEntity: z.string().optional(),
  entityType: z.string().optional(),
  role: z.string().min(1, 'Please select your role'),
}).refine((data) => {
  if (data.isTrustEntity) {
    return data.entityName && data.relationshipToEntity && data.entityType;
  }
  return true;
}, {
  message: "Entity information is required when 'Trust/Entity' is selected",
  path: ["entityName"],
});

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

interface ConciergePersonalInfoStepProps {
  formData: ConciergeFormData;
  updateFormData: (data: Partial<ConciergeFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  customer: Customer;
}

export const ConciergePersonalInfoStep: React.FC<ConciergePersonalInfoStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  customer
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: formData.address || '',
      parcelNumber: formData.parcelNumber || '',
      includeAllProperties: formData.includeAllProperties || false,
      isTrustEntity: formData.isTrustEntity || false,
      entityName: formData.entityName || '',
      relationshipToEntity: formData.relationshipToEntity || '',
      entityType: formData.entityType || '',
      role: formData.role || 'homeowner',
    },
  });

  const watchIsTrustEntity = form.watch('isTrustEntity');

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData(values);
    onNext();
  };

  const handleGooglePlacesDataChange = (data: GooglePlacesData) => {
    updateFormData({ googlePlacesData: data });
    // Mock property verification lookup
    setTimeout(() => {
      const mockVerificationData = {
        legalOwnerName: data.formattedAddress?.includes('Main') ? 'Smith Family Trust' : 
                       data.formattedAddress?.includes('Oak') ? 'Johnson, Robert & Mary' :
                       data.formattedAddress?.includes('Elm') ? 'ABC Properties LLC' :
                       'Williams, John Michael',
        parcelNumber: `PAR-${Math.floor(Math.random() * 900000) + 100000}`,
        address: data.formattedAddress
      };
      updateFormData({ verificationData: mockVerificationData });
    }, 1000);
  };

  const estimatedSavings = 2847; // Mock value

  return (
    <div className="space-y-8 animate-slide-in-right">
      {/* Customer Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <User className="h-5 w-5" />
            Selected Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">Name:</span>
              <p className="text-muted-foreground">{customer.first_name} {customer.last_name}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Email:</span>
              <p className="text-muted-foreground">{customer.email}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Existing Properties:</span>
              <p className="text-muted-foreground">{customer.property_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Savings */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <CardContent className="relative p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 rounded-full p-4">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Estimated Annual Tax Savings</h3>
          <div className="text-4xl font-bold text-primary mb-4">
            $<AnimatedCounter end={estimatedSavings} />
          </div>
          <p className="text-muted-foreground">
            Based on similar properties in this area
          </p>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property & Customer Information
          </CardTitle>
          <CardDescription>
            Please provide the property details and customer information for this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Property Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address *</FormLabel>
                    <FormControl>
                      <GooglePlacesAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        onPlacesDataChange={handleGooglePlacesDataChange}
                        placeholder="Enter property address"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Verification */}
              {formData.verificationData && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-5 w-5" />
                      Property Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-3">Property Records Found:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-yellow-800">Legal Owner Name:</span>
                          <p className="text-yellow-700 font-semibold">{formData.verificationData.legalOwnerName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-yellow-800">Parcel Number:</span>
                          <p className="text-yellow-700 font-semibold">{formData.verificationData.parcelNumber}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Parcel Number */}
              <FormField
                control={form.control}
                name="parcelNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcel Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter parcel number if known" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Entity Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>

                <FormField
                  control={form.control}
                  name="isTrustEntity"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Is this property owned by a trust or entity?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === 'true')}
                          value={field.value ? 'true' : 'false'}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="individual" />
                            <label htmlFor="individual" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              No, I am an individual property owner
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="trust-entity" />
                            <label htmlFor="trust-entity" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Yes, this property is owned by a trust or entity
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchIsTrustEntity && (
                  <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-medium text-foreground">Entity Details</h4>
                    
                    <FormField
                      control={form.control}
                      name="entityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trust/Entity Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter the full legal name of the trust or entity"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="relationshipToEntity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Relationship to Entity *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Trustee, Managing Member, President"
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
                          <FormLabel>Entity Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select entity type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="trust">Trust</SelectItem>
                              <SelectItem value="llc">LLC</SelectItem>
                              <SelectItem value="corporation">Corporation</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
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
                      <FormLabel>Your Role *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
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

              {/* Property Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Property Options
                </h3>
                
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
                        <p className="text-xs text-muted-foreground">
                          Check this if there are multiple properties at this address that should be included in the protest.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrev}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};