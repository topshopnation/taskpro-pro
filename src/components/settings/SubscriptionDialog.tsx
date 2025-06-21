
import { useSubscription } from "@/contexts/subscription";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import PlanSelector from "./subscription/PlanSelector";
import { createSubscriptionUrl } from "./subscription/subscriptionUtils";
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
  
  // Check if user has had a trial before (expired trial users cannot get another trial)
  const hasExpiredTrial = subscription?.status === 'expired' && subscription.trial_end_date;
  
  // Reset plan type to monthly when dialog opens
  useEffect(() => {
    if (open) {
      setPlanType("monthly");
      setPaymentError(null);
      console.log("SubscriptionDialog opened - current subscription:", subscription);
    }
  }, [open, subscription]);
  
  const openSubscriptionLink = async () => {
    if (!user) {
      toast.error("You must be signed in to subscribe");
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    console.log("Creating subscription URL for user:", user.id, "plan type:", planType);
    
    try {
      const subscriptionUrl = await createSubscriptionUrl(planType, user.id);
      
      if (subscriptionUrl) {
        console.log("Opening PayPal subscription URL:", subscriptionUrl);
        window.open(subscriptionUrl, "_blank");
        toast.info("Complete your subscription in the new tab to activate auto-renewal");
        onOpenChange(false);
      } else {
        throw new Error("Failed to generate subscription URL");
      }
    } catch (error: any) {
      console.error("Error initiating subscription:", error);
      setPaymentError(error.message || "Failed to initiate subscription process. Please try again.");
      toast.error(error.message || "Failed to initiate subscription process. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getDialogTitle = () => {
    if (subscription?.status === 'active') {
      return 'Manage Your Subscription';
    }
    if (hasExpiredTrial) {
      return 'Upgrade to Paid Plan';
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
    if (hasExpiredTrial) {
      return 'Your trial has expired. Upgrade to a paid plan to continue using TaskPro Pro features.';
    }
    if (isTrialActive) {
      return 'Your trial is active! Upgrade now to continue enjoying TaskPro Pro features.';
    }
    return 'Subscribe to unlock unlimited projects, advanced features, and priority support.';
  };

  const getButtonText = () => {
    if (subscription?.status === 'active') {
      return 'Update Plan';
    }
    if (hasExpiredTrial) {
      return 'Upgrade to Paid Plan';
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
          <DialogTitle>
            {subscription?.status === 'active' ? 'Manage Your Subscription' : 
             hasExpiredTrial ? 'Upgrade to Paid Plan' :
             isTrialActive ? 'Upgrade Your Trial' : 'Subscribe to TaskPro Pro'}
          </DialogTitle>
          <DialogDescription>
            {subscription?.status === 'active' ? 'Change your subscription plan or manage billing details.' :
             hasExpiredTrial ? 'Your trial has expired. Upgrade to a paid plan to continue using TaskPro Pro features.' :
             isTrialActive ? 'Your trial is active! Upgrade now to continue enjoying TaskPro Pro features.' :
             'Subscribe to unlock unlimited projects, advanced features, and priority support.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}

          {hasExpiredTrial && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your trial period has ended. You can only subscribe to a paid plan - trial renewals are not available.
              </AlertDescription>
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
          <Button 
            onClick={openSubscriptionLink} 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : 
             subscription?.status === 'active' ? 'Update Plan' :
             hasExpiredTrial ? 'Upgrade to Paid Plan' :
             isTrialActive ? 'Upgrade Now' : 'Subscribe Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
