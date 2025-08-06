import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, FileText, User, Building, MapPin, Loader2 } from 'lucide-react';
import { ConciergeFormData } from '../AddPropertyMultiStepForm';

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

interface ConciergeReviewStepProps {
  formData: ConciergeFormData;
  updateFormData: (data: Partial<ConciergeFormData>) => void;
  onComplete: () => void;
  onPrev: () => void;
  customer: Customer;
}

export const ConciergeReviewStep: React.FC<ConciergeReviewStepProps> = ({
  formData,
  updateFormData,
  onComplete,
  onPrev,
  customer
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async () => {
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
        
        // Update existing owner with entity information if provided
        if (formData.isTrustEntity) {
          const { error: updateError } = await supabase
            .from('owners')
            .update({
              name: formData.entityName || `${customer.first_name} ${customer.last_name}`,
               owner_type: formData.isTrustEntity ? (formData.entityType?.toLowerCase() || 'trust') : 'individual',
              form_entity_name: formData.entityName,
              form_entity_type: formData.entityType,
              entity_relationship: formData.relationshipToEntity,
            })
            .eq('id', ownerId);

          if (updateError) {
            throw new Error(`Owner update error: ${updateError.message}`);
          }
        }
      } else {
        // Create owner record if none exists
        const { data: owner, error: ownerError } = await supabase
          .from('owners')
          .insert([{
            name: formData.isTrustEntity ? formData.entityName : `${customer.first_name} ${customer.last_name}`,
            owner_type: formData.isTrustEntity ? (formData.entityType?.toLowerCase() || 'trust') : 'individual',
            created_by_user_id: customer.user_id,
            form_entity_name: formData.entityName,
            form_entity_type: formData.entityType,
            entity_relationship: formData.relationshipToEntity,
          }])
          .select()
          .single();

        if (ownerError) {
          throw new Error(`Owner creation error: ${ownerError.message}`);
        }

        ownerId = owner.id;
      }

      // Get existing contact for this customer
      const { data: existingContacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', customer.email)
        .limit(1);

      if (contactsError) {
        throw new Error(`Error finding customer contact: ${contactsError.message}`);
      }

      let contactId: string;

      if (existingContacts && existingContacts.length > 0) {
        contactId = existingContacts[0].id;
      } else {
        // Create contact record
        const { data: contact, error: contactError } = await supabase
          .from('contacts')
          .insert([{
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            phone: customer.phone,
            company: formData.isTrustEntity ? formData.entityName : null,
            source: 'concierge_add_property',
            status: 'active',
            notes: `Property added via concierge for property at ${formData.address}`,
          }])
          .select()
          .single();

        if (contactError) {
          throw new Error(`Contact creation error: ${contactError.message}`);
        }

        contactId = contact.id;
      }

      // Create property record with Google Places data
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert([{
          user_id: customer.user_id,
          situs_address: formData.address,
          parcel_number: formData.parcelNumber || null,
          include_all_properties: formData.includeAllProperties,
          owner_id: ownerId,
          contact_id: contactId,
          // Add Google Places data
          county: formData.googlePlacesData?.county || null,
          place_id: formData.googlePlacesData?.placeId || null,
          formatted_address: formData.googlePlacesData?.formattedAddress || null,
          google_address_components: formData.googlePlacesData?.addressComponents || null,
          latitude: formData.googlePlacesData?.latitude || null,
          longitude: formData.googlePlacesData?.longitude || null,
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
          is_owner_verified: formData.isOwnerVerified,
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

      onComplete();

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
    <div className="space-y-8 animate-slide-in-right">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review Application Details
        </h2>
        <p className="text-muted-foreground">
          Please review all information before submitting the application.
        </p>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-muted-foreground">Name:</span>
              <p className="text-foreground">{customer.first_name} {customer.last_name}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Email:</span>
              <p className="text-foreground">{customer.email}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Phone:</span>
              <p className="text-foreground">{customer.phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Role:</span>
              <p className="text-foreground">{getRoleLabel(formData.role)}</p>
            </div>
          </div>

          {formData.isTrustEntity && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-foreground mb-2">Entity Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-muted-foreground">Entity Name:</span>
                    <p className="text-foreground">{formData.entityName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Entity Type:</span>
                    <p className="text-foreground">{formData.entityType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Relationship:</span>
                    <p className="text-foreground">{formData.relationshipToEntity}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <span className="font-medium text-muted-foreground">Property Address:</span>
              <p className="text-foreground">{formData.address}</p>
            </div>
            {formData.parcelNumber && (
              <div>
                <span className="font-medium text-muted-foreground">Parcel Number:</span>
                <p className="text-foreground">{formData.parcelNumber}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Include All Properties:</span>
              <p className="text-foreground">{formData.includeAllProperties ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {formData.verificationData && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-foreground mb-2">Property Records</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-muted-foreground">Owner of Record:</span>
                    <p className="text-foreground">{formData.verificationData.legalOwnerName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Parcel Number:</span>
                    <p className="text-foreground">{formData.verificationData.parcelNumber}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Legal Agreement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal Agreement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-foreground leading-relaxed">
              By submitting this application, the customer agrees to authorize our services to represent them
              in their property tax appeal proceedings. Documents will be generated and sent to the customer's
              email address on file for their review and signature.
            </p>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-foreground">
              Customer has verified they are authorized to sign for this property
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex-1"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          variant="accent"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting Application...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </div>
    </div>
  );
};