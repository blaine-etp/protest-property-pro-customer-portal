import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormData } from '../MultiStepForm';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  isOwnerVerified: z.boolean().refine((val) => val === true, {
    message: "You must verify that you are the owner of record to continue.",
  }),
});

interface VerificationStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const VerificationStep: React.FC<VerificationStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      isOwnerVerified: false,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData(values);
    onNext();
  };

  return (
    <div className="space-y-8 animate-slide-in-right">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Property Verification
        </h2>
      </div>

      <div className="bg-card/50 rounded-lg p-6 border border-border">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground">Owner of Record:</span>
            <span className="text-muted-foreground">
              {/* TODO: This will be populated from database after Supabase integration */}
              [Database: Owner Name]
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-foreground">Parcel Number:</span>
            <span className="text-muted-foreground">
              {/* TODO: This will be populated from database after Supabase integration */}
              [Database: Parcel Number]
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Can you verify that you are the owner of record and verified to sign for this property?
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="isOwnerVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base font-medium">
                        Yes, I verify that I am the owner of record and authorized to sign for this property.
                      </FormLabel>
                      <FormMessage />
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
      </div>
    </div>
  );
};