import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormData } from '../MultiStepForm';
import { DollarSign } from 'lucide-react';
import { AnimatedCounter } from '../AnimatedCounter';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  isTrustEntity: z.boolean(),
  entityName: z.string().optional(),
  relationshipToEntity: z.string().optional(),
  entityType: z.enum(['LLC', 'Corporation', 'Partnership', 'Estate', 'Trust', 'Other']).optional(),
  role: z.enum(['homeowner', 'property_manager', 'authorized_person']),
}).refine((data) => {
  if (data.isTrustEntity) {
    return data.entityName && data.relationshipToEntity && data.entityType;
  }
  return true;
}, {
  message: "Entity name, relationship, and type are required when property is owned by an entity",
  path: ["entityName"],
});

interface SavingsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  showVerification: boolean;
  setShowVerification: (show: boolean) => void;
  readOnlyFields?: string[];
}

export const SavingsStep: React.FC<SavingsStepProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  showVerification,
  setShowVerification,
  readOnlyFields = [],
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      isTrustEntity: formData.isTrustEntity || false,
      entityName: formData.entityName || '',
      relationshipToEntity: formData.relationshipToEntity || '',
      entityType: formData.entityType,
      role: formData.role,
    },
  });

  const isTrustEntity = form.watch('isTrustEntity');

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateFormData(values);
    setShowVerification(true);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'homeowner':
        return 'Home Owner';
      case 'property_manager':
        return 'Property Manager';
      case 'authorized_person':
        return 'Person Authorized by Home Owner';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          Good News! We Can Help!
        </h2>
        
        <div className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-8 mb-8 border border-primary/20 shadow-xl">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 rounded-2xl opacity-10">
            <div className="absolute top-4 right-4 w-16 h-16 bg-primary rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-accent rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-primary/30 rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <p className="text-lg text-muted-foreground mb-3 font-medium">
              Estimated Annual Tax Savings
            </p>
            <div className="flex items-center justify-center gap-2 text-5xl md:text-6xl font-bold text-primary mb-2">
              <DollarSign className="w-12 h-12 md:w-16 md:h-16" />
              <AnimatedCounter end={1000} className="tabular-nums" />
            </div>
            <p className="text-sm text-muted-foreground/80 italic">
              *Based on similar properties in your area
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">
          We need three pieces of information from you:
        </h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isTrustEntity"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    Is this property owned by a trust, LLC, or other entity?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value ? 'true' : 'false'}
                      className="flex flex-row space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="no" />
                        <FormLabel htmlFor="no" className="font-normal cursor-pointer">
                          No
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="yes" />
                        <FormLabel htmlFor="yes" className="font-normal cursor-pointer">
                          Yes
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {isTrustEntity && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="entityName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Entity Name" {...field} />
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
                        <FormLabel>Relationship to Entity *</FormLabel>
                        <FormControl>
                          <Input placeholder="Owner, Agent, Trustee, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Type of Entity *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="LLC" id="llc" />
                            <FormLabel htmlFor="llc" className="font-normal cursor-pointer">
                              LLC
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Corporation" id="corporation" />
                            <FormLabel htmlFor="corporation" className="font-normal cursor-pointer">
                              Corporation
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Partnership" id="partnership" />
                            <FormLabel htmlFor="partnership" className="font-normal cursor-pointer">
                              Partnership
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Estate" id="estate" />
                            <FormLabel htmlFor="estate" className="font-normal cursor-pointer">
                              Estate
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Trust" id="trust" />
                            <FormLabel htmlFor="trust" className="font-normal cursor-pointer">
                              Trust
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Other" id="other" />
                            <FormLabel htmlFor="other" className="font-normal cursor-pointer">
                              Other
                            </FormLabel>
                          </div>
                        </RadioGroup>
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
                  <FormLabel>Your Relationship to the Property</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="homeowner">Home Owner</SelectItem>
                      <SelectItem value="property_manager">Property Manager</SelectItem>
                      <SelectItem value="authorized_person">Person Authorized by Home Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
  );
};