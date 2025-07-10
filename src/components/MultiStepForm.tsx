import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SavingsStep } from './form-steps/SavingsStep';
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
  signature?: string;
}

interface MultiStepFormProps {
  address: string;
  onComplete?: () => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ address, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    address: address,
    firstName: '',
    lastName: '',
    isTrustEntity: false,
    role: 'homeowner',
    email: '',
    phone: '',
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SavingsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
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
      
      <Card>
        <CardContent className="p-8">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiStepForm;