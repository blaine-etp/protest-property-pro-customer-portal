import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckCircle } from 'lucide-react';
import { ConciergeFormData } from '../AddPropertyMultiStepForm';

const schema = z.object({
  isOwnerVerified: z.boolean().refine((val) => val === true, {
    message: "Customer must verify that they are the owner of record to continue.",
  }),
});

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

interface ConciergeVerificationStepProps {
  formData: ConciergeFormData;
  updateFormData: (data: Partial<ConciergeFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  customer: Customer;
}

export const ConciergeVerificationStep: React.FC<ConciergeVerificationStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  customer
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      isOwnerVerified: formData.isOwnerVerified || false,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData(values);
    onNext();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'homeowner':
        return 'Homeowner';
      case 'property_manager':
        return 'Property Manager';
      case 'authorized_person':
        return 'Authorized Person';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-8 animate-slide-in-right">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Property & Customer Verification
        </h2>
      </div>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Customer Name:</span>
                <span className="text-muted-foreground">
                  {customer.first_name} {customer.last_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Email:</span>
                <span className="text-muted-foreground">
                  {customer.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Role:</span>
                <span className="text-muted-foreground">
                  {getRoleLabel(formData.role)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Property Address:</span>
                <span className="text-muted-foreground">
                  {formData.address}
                </span>
              </div>
            </div>

            {formData.isTrustEntity && (
              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-2">Entity Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Entity Name:</span>
                    <span className="text-muted-foreground">
                      {formData.entityName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Entity Type:</span>
                    <span className="text-muted-foreground">
                      {formData.entityType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Relationship:</span>
                    <span className="text-muted-foreground">
                      {formData.relationshipToEntity}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {formData.verificationData && (
              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-2">Property Records</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Owner of Record:</span>
                    <span className="text-muted-foreground">
                      {formData.verificationData.legalOwnerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Parcel Number:</span>
                    <span className="text-muted-foreground">
                      {formData.verificationData.parcelNumber}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardContent className="pt-6">
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Please confirm with the customer that they verify the following:
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
                        <p className="text-sm text-muted-foreground">
                          The customer confirms they have the legal authority to proceed with this property tax appeal.
                        </p>
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
                    Continue to Review
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};