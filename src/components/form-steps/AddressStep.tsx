import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

  const onSubmit = async (values: z.infer<typeof schema>) => {
    updateFormData(values);
    
    // TODO: Backend integration needed here
    // This would call your backend to:
    // 1. Validate the address
    // 2. Calculate estimated savings
    // 3. Get parcel number
    
    // For now, simulate the API call
    const mockSavings = Math.floor(Math.random() * 2000) + 500;
    const mockParcelNumber = `${Math.floor(Math.random() * 100000)}`;
    
    updateFormData({
      estimatedSavings: mockSavings,
      parcelNumber: mockParcelNumber,
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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