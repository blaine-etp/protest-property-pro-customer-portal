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
  isOwnerVerified?: boolean;
  signature?: string;
}

interface MultiStepFormProps {
  address: string;
  onComplete?: () => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ address, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [previousStep, setPreviousStep] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    address: address,
    firstName: '',
    lastName: '',
    isTrustEntity: false,
    role: 'homeowner',
    email: '',
    phone: '',
    agreeToUpdates: true,
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps && !isTransitioning) {
      setIsTransitioning(true);
      setPreviousStep(currentStep);
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setTimeout(() => {
          setPreviousStep(null);
          setIsTransitioning(false);
        }, 300);
      }, 50);
    }
  };

  const prevStep = () => {
    if (currentStep > 1 && !isTransitioning) {
      setIsTransitioning(true);
      setPreviousStep(currentStep);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setTimeout(() => {
          setPreviousStep(null);
          setIsTransitioning(false);
        }, 300);
      }, 50);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <SavingsStepContainer
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={() => onComplete?.()}
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
            onComplete={() => onComplete?.()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <Progress value={progress} className="w-full h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
      
      <div className="relative">
        {/* Previous step sliding out */}
        {previousStep && (
          <Card key={`prev-${previousStep}`} className="absolute inset-0 animate-slide-out-left">
            <CardContent className="p-8">
              {renderStepContent(previousStep)}
            </CardContent>
          </Card>
        )}
        
        {/* Current step sliding in */}
        <Card key={`current-${currentStep}`} className="animate-slide-in-right">
          <CardContent className="p-8">
            {renderStepContent(currentStep)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiStepForm;