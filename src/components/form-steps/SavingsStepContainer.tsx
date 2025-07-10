import React, { useState } from 'react';
import { SavingsStep } from './SavingsStep';
import { VerificationStep } from './VerificationStep';
import { FormData } from '../MultiStepForm';
import { Card, CardContent } from '@/components/ui/card';

interface SavingsStepContainerProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const SavingsStepContainer: React.FC<SavingsStepContainerProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}) => {
  const [showVerification, setShowVerification] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'in' | 'out'>('in');
  const [oldStep, setOldStep] = useState<React.ReactNode>(null);
  const [newStep, setNewStep] = useState<React.ReactNode>(null);

  const handleVerificationNext = () => {
    onNext();
  };

  const handleVerificationPrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setAnimationDirection('out');
      
      const currentStep = (
        <Card className="absolute inset-0 animate-slide-out-left">
          <CardContent className="p-8">
            <VerificationStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleVerificationNext}
              onPrev={handleVerificationPrev}
            />
          </CardContent>
        </Card>
      );
      
      const nextStep = (
        <Card className="absolute inset-0 animate-slide-in-right">
          <CardContent className="p-8">
            <SavingsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={onNext}
              onPrev={onPrev}
              showVerification={showVerification}
              setShowVerification={setShowVerification}
            />
          </CardContent>
        </Card>
      );
      
      setOldStep(currentStep);
      setNewStep(nextStep);
      
      setTimeout(() => {
        setShowVerification(false);
        setOldStep(null);
        setNewStep(null);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleShowVerification = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setAnimationDirection('out');
      
      const currentStep = (
        <Card className="absolute inset-0 animate-slide-out-left">
          <CardContent className="p-8">
            <SavingsStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={onNext}
              onPrev={onPrev}
              showVerification={showVerification}
              setShowVerification={setShowVerification}
            />
          </CardContent>
        </Card>
      );
      
      const nextStep = (
        <Card className="absolute inset-0 animate-slide-in-right">
          <CardContent className="p-8">
            <VerificationStep
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleVerificationNext}
              onPrev={handleVerificationPrev}
            />
          </CardContent>
        </Card>
      );
      
      setOldStep(currentStep);
      setNewStep(nextStep);
      
      setTimeout(() => {
        setShowVerification(true);
        setOldStep(null);
        setNewStep(null);
        setIsTransitioning(false);
      }, 300);
    }
  };

  if (isTransitioning) {
    return (
      <div className="relative h-full">
        {oldStep}
        {newStep}
      </div>
    );
  }

  if (showVerification) {
    return (
      <VerificationStep
        formData={formData}
        updateFormData={updateFormData}
        onNext={handleVerificationNext}
        onPrev={handleVerificationPrev}
      />
    );
  }

  return (
    <SavingsStep
      formData={formData}
      updateFormData={updateFormData}
      onNext={onNext}
      onPrev={onPrev}
      showVerification={showVerification}
      setShowVerification={handleShowVerification}
    />
  );
};