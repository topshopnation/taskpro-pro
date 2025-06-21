
import { useSubscription } from "@/contexts/subscription";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import PlanSelector from "./subscription/PlanSelector";
import { createSubscriptionUrl } from "./subscription/subscriptionUtils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { subscriptionPlanService } from "@/services/subscriptionPlanService";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const { subscription, isTrialActive } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Reset plan type to monthly when dialog opens and check for plans
  useEffect(() => {
    if (open) {
      setPlanType("monthly");
      setPaymentError(null);
      setPlansError(null);
      checkSubscriptionPlans();
    }
  }, [open]);

  const checkSubscriptionPlans = async () => {
    setIsLoadingPlans(true);
    setPlansError(null);
    
    try {
      const activePlan = await subscriptionPlanService.getActivePlan();
      if (!activePlan) {
        setPlansError("No subscription plans are currently available. Please contact support.");
      }
    } catch (error: any) {
      console.error("Error loading subscription plans:", error);
      setPlansError("Failed to load subscription plans. Please try refreshing or contact support if the issue persists.");
    } finally {
      setIsLoadingPlans(false);
    }
  };
  
  const openSubscriptionLink = async () => {
    if (!user) {
      toast.error("You must be signed in to subscribe");
      return;
    }

    if (plansError) {
      toast.error("Cannot proceed without subscription plans. Please try refreshing.");
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    console.log("Creating subscription URL for user:", user.id, "plan type:", planType);
    
    try {
      const subscriptionUrl = await createSubscriptionUrl(planType, user.id);
      
      if (subscriptionUrl) {
        console.log("Opening PayPal subscription URL:", subscriptionUrl);
        // Open in new tab for better user experience
        window.open(subscriptionUrl, "_blank");
        toast.info("Complete your subscription in the new tab to activate auto-renewal");
        onOpenChange(false); // Close dialog after opening PayPal
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

  const hasErrors = paymentError || plansError;
  const canProceed = !isLoadingPlans && !plansError && !isProcessing;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {isLoadingPlans && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>Loading subscription plans...</AlertDescription>
            </Alert>
          )}

          {plansError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {plansError}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkSubscriptionPlans}
                  className="ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {paymentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
          
          {!isLoadingPlans && !plansError && (
            <PlanSelector 
              planType={planType} 
              onPlanTypeChange={setPlanType} 
            />
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={openSubscriptionLink} 
            disabled={!canProceed}
          >
            {isProcessing ? "Processing..." : getButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
