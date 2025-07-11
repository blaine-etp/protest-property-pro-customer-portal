import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SavingsStepContainer } from './form-steps/SavingsStepContainer';
import { ContactStep } from './form-steps/ContactStep';
import { ReviewStep } from './form-steps/ReviewStep';

export interface FormData {
  address: string;
  estimatedSavings?: number;
  parcelNumber?: string;
  firstName: string;
  lastName: string;
  isTrustEntity: boolean;
  role: 'homeowner' | 'property_manager' | 'authorized_person';
  email: string;
  phone: string;
  agreeToUpdates: boolean;
  includeAllProperties: boolean;
  isOwnerVerified?: boolean;
  signature?: string;
}

interface MultiStepFormProps {
  address: string;
  onComplete?: (formData: FormData) => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ address, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'in' | 'out'>('in');
  const [formData, setFormData] = useState<FormData>({
    address: address,
    firstName: '',
    lastName: '',
    isTrustEntity: false,
    role: 'homeowner',
    email: '',
    phone: '',
    agreeToUpdates: true,
    includeAllProperties: false,
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SavingsStepContainer
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={() => onComplete?.(formData)}
          />
        );
      case 2:
        return (
          <ContactStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <ReviewStep
            formData={formData}
            updateFormData={updateFormData}
            onPrev={prevStep}
            onComplete={() => onComplete?.(formData)}
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
    <div className="w-full max-w-2xl mx-auto p-6">
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
  );
};

export default MultiStepForm;