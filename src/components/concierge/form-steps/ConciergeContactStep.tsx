import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConciergeFormData } from '../AddPropertyMultiStepForm';
import { Mail } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  agreeToUpdates: z.boolean(),
  includeAllProperties: z.boolean(),
});

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

interface ConciergeContactStepProps {
  formData: ConciergeFormData;
  updateFormData: (data: Partial<ConciergeFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  customer: Customer;
}

export const ConciergeContactStep: React.FC<ConciergeContactStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  customer,
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: customer.email,
      phone: formData.phone || customer.phone || '',
      agreeToUpdates: formData.agreeToUpdates ?? true,
      includeAllProperties: formData.includeAllProperties ?? false,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData(values);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Contact Details
        </h2>
        <p className="text-muted-foreground">
          We'll use this information to keep the customer updated on their case
        </p>
      </div>

      <Alert className="border-accent bg-accent/10">
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> This will send a contract to the customer via email for signature rather than completing the signature process through the web portal.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="customer.email@example.com"
                    disabled={true}
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Email is pre-populated from customer record and cannot be changed
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
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
                    Customer agrees to receive property tax updates and notifications via email and text. Msg & data rates may apply.
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
                    Please include all properties listed under this address.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

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
    </div>
  );
};