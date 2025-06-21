
import { useSubscription } from "@/contexts/subscription";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  const { subscription, isTrialActive } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Reset plan type to monthly when dialog opens
  useEffect(() => {
    if (open) {
      setPlanType("monthly");
      setPaymentError(null);
    }
  }, [open]);
  
  const openPaymentLink = async () => {
    if (!user) {
      toast.error("You must be signed in to subscribe");
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    console.log("Creating payment URL for user:", user.id, "plan type:", planType);
    
    try {
      const paymentUrl = await createPaymentUrl(planType, user.id);
      
      if (paymentUrl) {
        if (paymentUrl.includes("client-id=test")) {
          console.log("Test mode payment - simulated PayPal redirect");
          onOpenChange(false);
        } else {
          window.open(paymentUrl, "_blank");
          toast.info("Complete your payment in the new tab to activate your subscription");
        }
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPaymentError("Failed to initiate payment process. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getDialogTitle = () => {
    if (subscription?.status === 'active') {
      return 'Manage Your Subscription';
    }
    if (isTrialActive) {
      return 'Upgrade Your Trial';
    }
    return 'Subscribe to TaskPro Pro';
  };

  const getDialogDescription = () => {
    if (subscription?.status === 'active') {
      return 'Change your subscription plan or manage billing details.';
    }
    if (isTrialActive) {
      return 'Your trial is active! Upgrade now to continue enjoying TaskPro Pro features.';
    }
    return 'Unlock unlimited projects, advanced features, and priority support.';
  };

  const getButtonText = () => {
    if (subscription?.status === 'active') {
      return 'Update Plan';
    }
    if (isTrialActive) {
      return 'Upgrade Now';
    }
    return 'Subscribe Now';
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
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
            {isProcessing ? "Processing..." : getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
