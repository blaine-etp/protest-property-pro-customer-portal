import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormData } from '../MultiStepForm';
import { useToast } from '@/hooks/use-toast';
import { useSimplifiedFormSubmission } from '@/hooks/useSimplifiedFormSubmission';
import { SupportDialog } from '../SupportDialog';
import { useNavigate } from 'react-router-dom';

interface ReviewStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onPrev: () => void;
  onComplete: (signature?: string) => void;
  readOnlyFields?: string[];
  isAddPropertyMode?: boolean;
  isSubmitting?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  updateFormData,
  onPrev,
  onComplete,
  readOnlyFields = [],
  isAddPropertyMode = false,
  isSubmitting: propIsSubmitting = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const typedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'typed' | 'drawn'>('typed');
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const { toast } = useToast();
  const { submitFormData, isSubmitting } = useSimplifiedFormSubmission();
  const navigate = useNavigate();

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
    if (signatureMode === 'drawn') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setHasSignature(false);
        }
      }
    } else {
      setHasSignature(false);
    }
  };

  const generateTypedSignature = () => {
    const canvas = typedCanvasRef.current;
    if (!canvas || !formData.firstName || !formData.lastName) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font and style for cursive signature
    ctx.font = '36px Dancing Script, cursive';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the name in cursive
    const fullName = `${formData.firstName} ${formData.lastName}`;
    ctx.fillText(fullName, canvas.width / 2, canvas.height / 2);
    
    setHasSignature(true);
  };

  // Generate typed signature when mode changes to typed or name changes
  React.useEffect(() => {
    if (signatureMode === 'typed' && formData.firstName && formData.lastName) {
      generateTypedSignature();
    }
  }, [signatureMode, formData.firstName, formData.lastName]);

  const handleSubmit = async () => {
    // Check for Place ID before proceeding
    if (!formData.placeId) {
      setShowSupportDialog(true);
      return;
    }

    if (!hasSignature) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature to complete the process.",
        variant: "destructive",
      });
      return;
    }

    // Save signature to form data
    const canvas = signatureMode === 'drawn' ? canvasRef.current : typedCanvasRef.current;
    if (canvas) {
      const signatureDataURL = canvas.toDataURL();
      const updatedFormData = { 
        ...formData, 
        signature: signatureDataURL, 
        isOwnerVerified: true 
      };
      updateFormData(updatedFormData);

      if (isAddPropertyMode) {
        // In add property mode, pass signature directly to avoid race condition
        console.log('🖊️ Passing signature to completion handler:', signatureDataURL ? 'Present' : 'Missing');
        onComplete(signatureDataURL);
      } else {
        // New simplified signup flow
        const result = await submitFormData(updatedFormData as any);
        
        if ((result as any)?.success) {
          toast({
            title: "Application Submitted!",
            description: "Check your email for verification...",
          });
          // Hook handles email verification redirect
          return;
        }
        
        // Check if we need to show support dialog for missing place ID
        if ((result as any)?.showSupport) {
          setShowSupportDialog(true);
        }
        
      }

    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'homeowner':
        return 'Property Owner';
      case 'property_manager':
        return 'Property Manager';
      case 'authorized_person':
        return 'Person Authorized by Home Owner';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Last step before <span className="text-primary">${(formData.estimatedSavings || 1000).toLocaleString()}</span> in potential savings!
        </h2>
        {/* TODO: This savings amount should come from database and match the amount shown in step 1 */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Situs Address:</span>
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
        <h4 className="font-medium mb-4">Digital Signature</h4>
        
        {/* Signature Mode Selection */}
        <RadioGroup 
          value={signatureMode} 
          onValueChange={(value: 'typed' | 'drawn') => setSignatureMode(value)}
          className="mb-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="typed" id="typed" />
            <Label htmlFor="typed">Type my signature</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="drawn" id="drawn" />
            <Label htmlFor="drawn">Draw my signature</Label>
          </div>
        </RadioGroup>

        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4">
          {signatureMode === 'typed' ? (
            <>
              {/* Typed Signature Preview */}
              <div className="w-full h-[150px] border rounded bg-background flex items-center justify-center">
                <canvas
                  ref={typedCanvasRef}
                  width={400}
                  height={150}
                  className="max-w-full"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  Your typed signature: {formData.firstName} {formData.lastName}
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
            </>
          ) : (
            <>
              {/* Hand-drawn Signature Canvas */}
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
            </>
          )}
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
          disabled={isAddPropertyMode ? propIsSubmitting : isSubmitting}
          className="flex-1"
        >
          {(isAddPropertyMode ? propIsSubmitting : isSubmitting) ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
      
      <SupportDialog 
        open={showSupportDialog} 
        onOpenChange={setShowSupportDialog}
      />
    </div>
  );
};