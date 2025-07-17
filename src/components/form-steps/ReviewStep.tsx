import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { FormData } from '../MultiStepForm';
import { useToast } from '@/hooks/use-toast';
import { useFormSubmission } from '@/hooks/useFormSubmission';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

interface ReviewStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onPrev: () => void;
  onComplete: () => void;
  readOnlyFields?: string[];
  isAddPropertyMode?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  updateFormData,
  onPrev,
  onComplete,
  readOnlyFields = [],
  isAddPropertyMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const { toast } = useToast();
  const { submitFormData, isSubmitting, submissionStage, submissionProgress } = useFormSubmission();

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setHasSignature(true);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!hasSignature) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature to complete the process.",
        variant: "destructive",
      });
      return;
    }

    // Save signature to form data
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureDataURL = canvas.toDataURL();
      const updatedFormData = { 
        ...formData, 
        signature: signatureDataURL, 
        isOwnerVerified: true 
      };
      updateFormData(updatedFormData);

      if (isAddPropertyMode) {
        // For add property mode, use the onComplete callback which will handle the submission
        onComplete();
      } else {
        // Original signup flow logic
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          // Create user account with email confirmation
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: Math.random().toString(36).substring(2, 15), // Temporary password
            options: {
              emailRedirectTo: `${window.location.origin}/set-password`,
              data: {
                first_name: formData.firstName,
                last_name: formData.lastName,
              }
            }
          });

          if (error) {
            toast({
              title: "Submission Error",
              description: "Failed to create user account",
              variant: "destructive",
            });
            return;
          }

          if (data.user) {
            // Submit form data
            const result = await submitFormData(updatedFormData);
            if (result.success && result.token) {
              // Redirect to customer portal with token
              window.location.href = `/customer-portal?token=${result.token}`;
            }
          }
        } else {
          // Submit form data for existing user
          const result = await submitFormData(updatedFormData);
          if (result.success && result.token) {
            // Redirect to customer portal with token  
            window.location.href = `/customer-portal?token=${result.token}`;
          }
        }
      }
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'homeowner':
        return 'Home Owner';
      case 'property_manager':
        return 'Property Manager';
      case 'authorized_person':
        return 'Person Authorized by Home Owner';
      default:
        return '';
    }
  };

  const getStageMessage = (stage: string) => {
    switch (stage) {
      case 'profile':
        return 'Creating your profile...';
      case 'property':
        return 'Setting up property details...';
      case 'owner':
        return 'Linking ownership information...';
      case 'application':
        return 'Finalizing application...';
      case 'documents':
        return 'Generating documents...';
      case 'complete':
        return 'Application completed successfully!';
      default:
        return 'Processing application...';
    }
  };

  const submissionSteps = [
    { id: 'profile', label: 'Profile', description: 'Creating your account' },
    { id: 'property', label: 'Property', description: 'Setting up property details' },
    { id: 'owner', label: 'Owner', description: 'Linking ownership information' },
    { id: 'application', label: 'Application', description: 'Finalizing application' },
    { id: 'documents', label: 'Documents', description: 'Generating required forms' },
  ];

  const getCurrentStepIndex = () => {
    return submissionSteps.findIndex(step => step.id === submissionStage);
  };

  return (
    <div className="space-y-6">
      {isSubmitting && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {getStageMessage(submissionStage)}
                </h3>
              </div>
              
              <div className="space-y-2">
                <Progress value={submissionProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  This usually takes 10-15 seconds...
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-6">
                {submissionSteps.map((step, index) => {
                  const currentIndex = getCurrentStepIndex();
                  const isComplete = index < currentIndex || submissionStage === 'complete';
                  const isCurrent = index === currentIndex;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center space-y-1">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                        ${isComplete 
                          ? 'bg-primary text-primary-foreground' 
                          : isCurrent 
                            ? 'bg-primary/20 text-primary border-2 border-primary' 
                            : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        {isComplete ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={`text-xs font-medium ${
                          isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isSubmitting && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Last step before <span className="text-primary">${(formData.estimatedSavings || 1000).toLocaleString()}</span> in potential savings!
          </h2>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Address:</span>
            <span>{formData.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Parcel Number:</span>
            <span>{formData.parcelNumber}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Name:</span>
            <span>{formData.firstName} {formData.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Email:</span>
            <span>{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Phone:</span>
            <span>{formData.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Role:</span>
            <span>{getRoleLabel(formData.role)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Trust/Entity Property:</span>
            <span>{formData.isTrustEntity ? 'Yes' : 'No'}</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          By Signing, You Acknowledge And Agree To The Following:
        </h3>
        
        <div className="space-y-3 text-sm">
          <p>
            <strong>1.</strong> You're Appointing EasyTaxProtest.com As Your Authorized Representative, 
            Allowing Us To Communicate With The Appraisal District On Your Behalf.
          </p>
          <p>
            <strong>2.</strong> We Will Complete And Submit The Required Agent Authorization Form 
            To Travis County For You.
          </p>
          <p>
            <strong>3.</strong> You Agree To Pay 25% Of Any Property Tax Savings We Secure, With Our 
            No Savings, No Fee Guarantee — If We Don't Lower Your Tax Bill, You Don't Owe Us A Thing.
          </p>
        </div>

        <Button 
          variant="link" 
          className="mt-2 p-0 h-auto text-accent"
        >
          Preview Agreement
        </Button>

        <p className="text-sm mt-4 font-medium">
          By Signing Below, You Indicate That You Have Read And Agree To The Terms Of 
          The Easy Tax Service And Authorization Agreements.
        </p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Digital Signature</h4>
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="w-full border rounded cursor-crosshair bg-background"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">
              Sign above with your mouse or finger
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          variant="accent"
          onClick={handleSubmit}
          disabled={isSubmitting || !hasSignature}
          className="flex-1"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Application...</span>
            </div>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
};