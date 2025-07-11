import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, Clock } from "lucide-react";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = () => {
    setTimeLeft(30);
    // Here you would trigger the resend email functionality
    console.log('Resending verification email to:', email);
  };

  const handleContinue = () => {
    navigate(`/customer-portal?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              We've sent a verification email to:
            </p>
            <p className="font-semibold text-primary break-all">{email}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>Click the verification link in your email</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>The link expires in 24 hours</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full"
              size="lg"
            >
              Continue to Customer Portal
            </Button>
            
            <Button
              variant="outline"
              onClick={handleResendEmail}
              className="w-full"
              disabled={timeLeft > 0}
            >
              {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Email'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;