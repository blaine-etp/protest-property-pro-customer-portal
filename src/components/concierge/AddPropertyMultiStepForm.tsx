import React, { useState } from 'react';
import { ConciergePersonalInfoStep } from './form-steps/ConciergePersonalInfoStep';
import { ConciergeVerificationStep } from './form-steps/ConciergeVerificationStep';
import { ConciergeReviewStep } from './form-steps/ConciergeReviewStep';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export interface ConciergeFormData {
  // Address information
  address: string;
  parcelNumber?: string;
  includeAllProperties: boolean;
  
  // Personal/Entity information
  isTrustEntity: boolean;
  entityName?: string;
  relationshipToEntity?: string;
  entityType?: string;
  role: string;
  
  // Verification
  isOwnerVerified: boolean;
  
  // Google Places data
  googlePlacesData?: any;
  
  // Property verification data
  verificationData?: any;
}

interface Customer {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  property_count: number;
}

interface AddPropertyMultiStepFormProps {
  customer: Customer;
  onBack: () => void;
  onSuccess: () => void;
  initialAddress?: string;
  googlePlacesData?: any;
  verificationData?: any;
}

const steps = [
  'Personal Information',
  'Verification',
  'Review & Submit'
];

export const AddPropertyMultiStepForm: React.FC<AddPropertyMultiStepFormProps> = ({
  customer,
  onBack,
  onSuccess,
  initialAddress = '',
  googlePlacesData = null,
  verificationData = null
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');

  const [formData, setFormData] = useState<ConciergeFormData>({
    address: initialAddress,
    parcelNumber: '',
    includeAllProperties: false,
    isTrustEntity: false,
    entityName: '',
    relationshipToEntity: '',
    entityType: '',
    role: 'homeowner',
    isOwnerVerified: false,
    googlePlacesData,
    verificationData
  });

  const updateFormData = (data: Partial<ConciergeFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setAnimationDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setAnimationDirection('left');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleFormComplete = () => {
    onSuccess();
  };

  const getAnimationClass = () => {
    if (!isTransitioning) return 'animate-slide-in-right';
    return animationDirection === 'right' ? 'animate-slide-out-left' : 'animate-slide-out-right';
  };

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      customer
    };

    switch (currentStep) {
      case 0:
        return (
          <ConciergePersonalInfoStep
            {...commonProps}
            onNext={nextStep}
            onPrev={onBack}
          />
        );
      case 1:
        return (
          <ConciergeVerificationStep
            {...commonProps}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 2:
        return (
          <ConciergeReviewStep
            {...commonProps}
            onComplete={handleFormComplete}
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Add New Property</h2>
          <p className="text-muted-foreground mt-1">
            Adding a property for {customer.first_name} {customer.last_name}
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {steps[currentStep]}
              </span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Form Step */}
      <div className={`transition-all duration-150 ${getAnimationClass()}`}>
        {renderStep()}
      </div>
    </div>
  );
};