
import { useSubscription } from "@/contexts/subscription";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import PlanSelector from "./subscription/PlanSelector";
import SubscriptionSummary from "./subscription/SubscriptionSummary";
import { createPaymentUrl, processPaymentConfirmation } from "./subscription/paymentUtils";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const { updateSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Reset plan type to monthly when dialog opens
  useEffect(() => {
    if (open) {
      setPlanType("monthly");
    }
  }, [open]);
  
  // PayPal return handling
  useEffect(() => {
    // Check for PayPal success parameters in URL
    const urlParams = new URLSearchParams(location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentType = urlParams.get('plan_type');
    
    if (paymentSuccess === 'true' && (paymentType === 'monthly' || paymentType === 'yearly')) {
      handleSuccessfulPayment(paymentType);
    }
  }, [location]);
  
  const handleSuccessfulPayment = async (paymentType: 'monthly' | 'yearly') => {
    setIsProcessing(true);
    
    try {
      await processPaymentConfirmation(paymentType, updateSubscription);
    } catch (error) {
      console.error("Error processing payment confirmation:", error);
      toast.error("Failed to activate subscription. Please contact support.");
    } finally {
      setIsProcessing(false);
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_success');
      url.searchParams.delete('plan_type');
      window.history.replaceState({}, document.title, url.toString());
    }
  };
  
  const openPaymentLink = () => {
    if (!user) {
      toast.error("You must be signed in to subscribe");
      return;
    }
    
    const paymentUrl = createPaymentUrl(planType, user.id);
    
    // Open payment link in a new window
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
          <PlanSelector 
            planType={planType} 
            onPlanTypeChange={setPlanType} 
          />
          
          <SubscriptionSummary planType={planType} />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              <span>
                Your subscription will automatically renew through PayPal. You can cancel anytime through your PayPal account.
              </span>
            </p>
          </div>
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
