import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SavingsStepContainer } from './form-steps/SavingsStepContainer';
import { ContactStep } from './form-steps/ContactStep';
import { ReviewStep } from './form-steps/ReviewStep';
import { FormData } from './MultiStepForm';
import { useAddPropertySubmission } from '@/hooks/useAddPropertySubmission';

interface AddPropertyFormProps {
  address: string;
  existingProfile: any; // Profile data from database
  onComplete: () => void;
  onBack: () => void;
  forceDatabaseSave?: boolean;
}

const AddPropertyForm: React.FC<AddPropertyFormProps> = ({ 
  address, 
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
  
  // Pre-populate form data from existing profile
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

  const handleFormComplete = async (formData: FormData) => {
    const result = await submitAddProperty(formData);
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
            onComplete={() => handleFormComplete(formData)}
            readOnlyFields={['email', 'phone']} // Only email and phone are read-only
            isAddPropertyMode={true}
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
            <CardContent className="p-8">
              {renderStep()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddPropertyForm;