
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { FormData } from '../MultiStepForm';
import { GooglePlacesAutocomplete } from '../GooglePlacesAutocomplete';
import { useGooglePlacesLookup } from '@/hooks/useGooglePlacesLookup';

const schema = z.object({
  address: z.string().min(1, 'Address is required'),
  includeAllProperties: z.boolean().default(false),
});

interface EnhancedAddressStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export const EnhancedAddressStep: React.FC<EnhancedAddressStepProps> = ({
  formData,
  updateFormData,
  onNext,
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: formData.address,
      includeAllProperties: formData.includeAllProperties || false,
    },
  });

  const { lookupAddress, isLoading: isLookingUp } = useGooglePlacesLookup();
  const [addressValidated, setAddressValidated] = useState(false);
  const [multiplePropertiesFound, setMultiplePropertiesFound] = useState<any[]>([]);
  const [placeData, setPlaceData] = useState<any>(null);

  const handleAddressChange = (address: string, googlePlacesData?: any) => {
    form.setValue('address', address);
    setAddressValidated(false);
    setMultiplePropertiesFound([]);
    
    if (googlePlacesData) {
      setPlaceData(googlePlacesData);
      // Auto-validate address when selected from Google Places
      handleAddressValidation(address, googlePlacesData, form.getValues('includeAllProperties'));
    }
  };

  const handleAddressValidation = async (address: string, googlePlacesData: any, includeAll: boolean) => {
    if (!address.trim() || !googlePlacesData) return;

    const result = await lookupAddress(address, googlePlacesData, includeAll);
    
    if (result) {
      setAddressValidated(true);
      
      // Update form data with results
      updateFormData({
        address: result.address,
        estimatedSavings: result.estimatedSavings,
        parcelNumber: result.parcelNumber,
        googlePlacesData: {
          place_id: result.placeId,
          formatted_address: result.address,
          ...googlePlacesData
        }
      });

      // Handle multiple properties if found
      if (result.multipleProperties && result.multipleProperties.length > 1) {
        setMultiplePropertiesFound(result.multipleProperties);
      }
    }
  };

  const handleIncludeAllPropertiesChange = (checked: boolean) => {
    form.setValue('includeAllProperties', checked);
    updateFormData({ includeAllProperties: checked });
    
    // Re-validate address with new setting
    if (addressValidated && placeData) {
      const currentAddress = form.getValues('address');
      handleAddressValidation(currentAddress, placeData, checked);
    }
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!addressValidated) {
      // Validate address if not already validated
      if (placeData) {
        await handleAddressValidation(values.address, placeData, values.includeAllProperties);
      }
      return;
    }
    
    updateFormData(values);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Enter Your Property Address
        </h2>
        <p className="text-muted-foreground">
          We'll use Google Places to validate your address and check for tax savings opportunities
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Property Address
                </FormLabel>
                <FormControl>
                  <GooglePlacesAutocomplete
                    value={field.value}
                    onChange={handleAddressChange}
                    placeholder="Start typing your address..."
                    className="text-lg py-6"
                    disabled={isLookingUp}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includeAllProperties"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={handleIncludeAllPropertiesChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Include all properties at this mailing address
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Check this if you want to include all properties that share the same mailing address
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Address Validation Status */}
          {isLookingUp && (
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Validating address...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">
                      {form.watch('includeAllProperties') 
                        ? 'Searching for all properties at this mailing address...' 
                        : 'Looking up property information...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Multiple Properties Found */}
          {multiplePropertiesFound.length > 1 && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Multiple Properties Found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-green-700">
                  Found {multiplePropertiesFound.length} properties at this mailing address:
                </p>
                <div className="space-y-2">
                  {multiplePropertiesFound.map((property, index) => (
                    <div key={index} className="p-3 bg-white rounded-md border border-green-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-green-900">{property.situs_address}</p>
                          <p className="text-sm text-green-600">Parcel: {property.parcelNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600">Assessed Value:</p>
                          <p className="font-medium text-green-900">${property.assessedValue?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Success */}
          {addressValidated && !isLookingUp && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Address Validated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-green-600">Estimated Savings</p>
                    <p className="text-2xl font-bold text-green-800">
                      ${formData.estimatedSavings?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600">Parcel Number</p>
                    <p className="font-medium text-green-800">{formData.parcelNumber}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600">
                      {multiplePropertiesFound.length > 1 ? 'Properties' : 'Property'}
                    </p>
                    <p className="font-medium text-green-800">
                      {multiplePropertiesFound.length > 1 ? `${multiplePropertiesFound.length} Found` : 'Validated'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            disabled={isLookingUp}
          >
            {isLookingUp ? 'Validating...' : (addressValidated ? 'Continue' : 'Validate Address')}
          </Button>
        </form>
      </Form>
    </div>
  );
};
