import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SavingsStepContainer } from './form-steps/SavingsStepContainer';
import { ContactStep } from './form-steps/ContactStep';
import { ReviewStep } from './form-steps/ReviewStep';
import { FormData } from './MultiStepForm';
import { useAddPropertySubmission } from '@/hooks/useAddPropertySubmission';
import { GooglePlacesData } from './GooglePlacesAutocomplete';

interface AddPropertyFormProps {
  address: string;
  googlePlacesData: GooglePlacesData | null;
  existingProfile: any; // Profile data from database
  onComplete: () => void;
  onBack: () => void;
  forceDatabaseSave?: boolean;
}

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ 
  address, 
  googlePlacesData,
  existingProfile, 
  onComplete,
  onBack,
  forceDatabaseSave = false
}) => {
  const { submitAddProperty, isSubmitting } = useAddPropertySubmission({
    existingUserId: existingProfile.user_id,
    isTokenAccess: false, // Using regular mock auth, not token access
    forceDatabaseSave
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'in' | 'out'>('in');
  
  // Pre-populate form data from existing profile and Google Places data
  const [formData, setFormData] = useState<FormData>({
    address: address,
    firstName: existingProfile.first_name || '',
    lastName: existingProfile.last_name || '',
    isTrustEntity: existingProfile.is_trust_entity || false,
    role: existingProfile.role || 'homeowner',
    email: existingProfile.email || '',
    phone: existingProfile.phone || '',
    agreeToUpdates: existingProfile.agree_to_updates || true,
    includeAllProperties: false, // Default for new property
    // Include Google Places data
    placeId: googlePlacesData?.placeId,
    formattedAddress: googlePlacesData?.formattedAddress || address,
    addressComponents: googlePlacesData?.addressComponents,
    latitude: googlePlacesData?.latitude,
    longitude: googlePlacesData?.longitude,
    county: googlePlacesData?.county,
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps && !isTransitioning) {
      setIsTransitioning(true);
      setAnimationDirection('out');
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setAnimationDirection('in');
        setTimeout(() => setIsTransitioning(false), 300);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 1 && !isTransitioning) {
      setIsTransitioning(true);
      setAnimationDirection('out');
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setAnimationDirection('in');
        setTimeout(() => setIsTransitioning(false), 300);
      }, 300);
    }
  };

  const handleFormComplete = async (signature?: string) => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    console.log('🖊️ AddPropertyForm received signature:', signature ? 'Present' : 'Missing');
    
    // Merge signature into form data if provided
    const finalFormData = signature 
      ? { ...formData, signature } 
      : formData;
    
    console.log('📋 Final form data for submission:', {
      hasSignature: !!finalFormData.signature,
      signatureLength: finalFormData.signature?.length || 0
    });
    
    const result = await submitAddProperty(finalFormData);
    if (result.success) {
      onComplete();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SavingsStepContainer
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={onBack}
            readOnlyFields={[]} // No read-only fields in savings step
          />
        );
      case 2:
        return (
          <ContactStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            readOnlyFields={['email', 'phone']} // Only email and phone are read-only
          />
        );
        case 3:
          return (
            <ReviewStep
              formData={formData}
              updateFormData={updateFormData}
              onPrev={prevStep}
              onComplete={handleFormComplete}
              readOnlyFields={['email', 'phone']} // Only email and phone are read-only
              isAddPropertyMode={true}
              isSubmitting={isSubmitting}
            />
          );
      default:
        return null;
    }
  };

  const getAnimationClass = () => {
    if (animationDirection === 'out') {
      return 'animate-slide-out-left';
    }
    return 'animate-slide-in-right';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Property</h1>
            <p className="text-muted-foreground">
              Complete the details for your new property
              {forceDatabaseSave && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Database Mode
                </span>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          
          <Card key={currentStep} className={getAnimationClass()}>
            <CardContent className="p-8 relative">
              {isSubmitting && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Adding property...</p>
                  </div>
                </div>
              )}
              {renderStep()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddPropertyForm;