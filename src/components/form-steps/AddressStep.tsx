import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { FormData } from '../MultiStepForm';

const schema = z.object({
  address: z.string().min(1, 'Address is required'),
});

interface AddressStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({
  formData,
  updateFormData,
  onNext,
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: formData.address,
    },
  });

  const [verificationData, setVerificationData] = React.useState<{
    legalOwnerName: string;
    parcelNumber: string;
  } | null>(null);
  const [isLookingUp, setIsLookingUp] = React.useState(false);

  const handleAddressLookup = async (address: string) => {
    if (!address.trim()) {
      setVerificationData(null);
      return;
    }

    setIsLookingUp(true);
    
    // TODO: Backend integration needed here
    // This would call your backend to lookup property information
    
    // Simulate API call for property lookup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data for verification
    const mockOwnerName = `${['John', 'Sarah', 'Michael', 'Jennifer', 'David'][Math.floor(Math.random() * 5)]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`;
    const mockParcelNumber = `${Math.floor(Math.random() * 100000)}`;
    
    setVerificationData({
      legalOwnerName: mockOwnerName,
      parcelNumber: mockParcelNumber,
    });
    
    setIsLookingUp(false);
  };

  const onSubmit = async (values: z.infer<typeof schema>) => {
    updateFormData(values);
    
    // TODO: Backend integration needed here
    // This would call your backend to:
    // 1. Validate the address
    // 2. Calculate estimated savings
    // 3. Get parcel number
    
    // For now, simulate the API call
    const mockSavings = Math.floor(Math.random() * 2000) + 500;
    
    updateFormData({
      estimatedSavings: mockSavings,
      parcelNumber: verificationData?.parcelNumber || `${Math.floor(Math.random() * 100000)}`,
    });
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Enter Your Property Address
        </h2>
        <p className="text-muted-foreground">
          We'll check if we can help reduce your property taxes
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your property address"
                    {...field}
                    className="text-lg py-6"
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
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {isLookingUp ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Looking up property information...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Verify Property Information
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLookingUp ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground">Retrieving property details...</p>
                    </div>
                  </div>
                ) : verificationData ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Please verify this information with the customer
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Confirm these details are correct before proceeding
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Legal Owner Name
                        </label>
                        <div className="p-3 bg-muted rounded-md border">
                          <p className="font-medium">{verificationData.legalOwnerName}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Parcel Number
                        </label>
                        <div className="p-3 bg-muted rounded-md border">
                          <p className="font-medium">{verificationData.parcelNumber}</p>
                        </div>
                      </div>
                     </div>
                   </div>
                 ) : null}
               </CardContent>
             </Card>
           )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Checking...' : 'Check Savings'}
          </Button>
        </form>
      </Form>
    </div>
  );
};