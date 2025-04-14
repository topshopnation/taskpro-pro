
import { useSubscription } from "@/contexts/subscription";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import PlanSelector from "./subscription/PlanSelector";
import { createPaymentUrl } from "./subscription/paymentUtils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const { updateSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const location = useLocation();
  const { user } = useAuth();
  
  // Reset plan type to monthly when dialog opens
  useEffect(() => {
    if (open) {
      setPlanType("monthly");
      setPaymentError(null);
    }
  }, [open]);
  
  // Clean up URL parameters
  const cleanupUrlParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('payment_success');
    url.searchParams.delete('payment_cancelled');
    url.searchParams.delete('plan_type');
    window.history.replaceState({}, document.title, url.toString());
  };
  
  const openPaymentLink = () => {
    if (!user) {
      toast.error("You must be signed in to subscribe");
      return;
    }
    
    setPaymentError(null);
    const paymentUrl = createPaymentUrl(planType, user.id);
    
    // Only open if we got a valid URL (user ID was present)
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
      toast.info("After completing payment, return to this page to activate your subscription");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Subscription</DialogTitle>
          <DialogDescription>
            Choose a plan that works for you and unlock all TaskPro features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
          
          <PlanSelector 
            planType={planType} 
            onPlanTypeChange={setPlanType} 
          />
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={openPaymentLink} disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Continue`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
