
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
  const { updateSubscription, subscription, fetchSubscription } = useSubscription();
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
      
      // Only open if we got a valid URL (user ID was present)
      if (paymentUrl) {
        // In test mode, the URL contains test client id
        if (paymentUrl.includes("client-id=test")) {
          // For test mode, we don't actually navigate to PayPal
          // The createPaymentUrl function will handle the redirection to settings page
          console.log("Test mode payment - simulated PayPal redirect");
          
          // Close the dialog since we're handling it automatically
          onOpenChange(false);
        } else {
          // For production, open in new window/tab
          window.open(paymentUrl, "_blank");
          toast.info("After completing payment, return to this page to activate your subscription");
        }
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPaymentError("Failed to initiate payment process. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {subscription?.status === 'active' ? 'Renew Your Subscription' : 'Upgrade Your Subscription'}
          </DialogTitle>
          <DialogDescription>
            {subscription?.status === 'active' 
              ? 'Choose a plan to renew your subscription.' 
              : 'Choose a plan that works for you and unlock all TaskPro features.'}
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
            {isProcessing ? "Processing..." : subscription?.status === 'active' ? 'Renew Now' : 'Subscribe Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
