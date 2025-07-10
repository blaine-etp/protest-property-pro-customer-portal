import React, { useState } from 'react';
import { SavingsStep } from './SavingsStep';
import { VerificationStep } from './VerificationStep';
import { FormData } from '../MultiStepForm';

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

  const handleVerificationNext = () => {
    onNext();
  };

  const handleVerificationPrev = () => {
    setShowVerification(false);
  };

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
      setShowVerification={setShowVerification}
    />
  );
};