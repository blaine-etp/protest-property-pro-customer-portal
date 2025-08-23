import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupportDialog: React.FC<SupportDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Need Help with Your Address?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <p className="text-center text-muted-foreground">
            We couldn't validate your address automatically. Please call or email us and we'll get you set up quickly.
          </p>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => window.open('tel:+15550123456')}
            >
              <Phone className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Call us</div>
                <div className="text-sm text-muted-foreground">(555) 012-3456</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => window.open('mailto:info@easytaxprotest.com')}
            >
              <Mail className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Email us</div>
                <div className="text-sm text-muted-foreground">info@easytaxprotest.com</div>
              </div>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full mt-4"
          >
            Continue with address search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};