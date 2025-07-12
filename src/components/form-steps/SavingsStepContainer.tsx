import React, { useState } from 'react';
import { SavingsStep } from './SavingsStep';
import { VerificationStep } from './VerificationStep';
import { FormData } from '../MultiStepForm';

interface SavingsStepContainerProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  readOnlyFields?: string[];
}

export const SavingsStepContainer: React.FC<SavingsStepContainerProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  readOnlyFields = []
}) => {
  const [showVerification, setShowVerification] = useState(false);

  const handleVerificationNext = () => {
    onNext();
  };

  const handleVerificationPrev = () => {
    setShowVerification(false);
  };

  const handleShowVerification = () => {
    setShowVerification(true);
  };

  if (showVerification) {
    return (
      <VerificationStep
        formData={formData}
        updateFormData={updateFormData}
        onNext={handleVerificationNext}
        onPrev={handleVerificationPrev}
        readOnlyFields={readOnlyFields}
      />
    );
  }

  return (
    <SavingsStep
      formData={formData}
      updateFormData={updateFormData}
      onNext={handleShowVerification}
      onPrev={onPrev}
      showVerification={showVerification}
      setShowVerification={handleShowVerification}
      readOnlyFields={readOnlyFields}
    />
  );
};