import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/contexts/subscription";
import { cancelSubscription } from "./subscriptionUtils";
import { format } from "date-fns";

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelSubscriptionDialog({ open, onOpenChange }: CancelSubscriptionDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { subscription, fetchSubscription } = useSubscription();

  const handleCancel = async () => {
    if (!user || !subscription?.paypal_subscription_id) {
      toast.error("Unable to cancel subscription - missing information");
      return;
    }

    setIsProcessing(true);
    
    try {
      await cancelSubscription(subscription.paypal_subscription_id);
      toast.success("Subscription canceled successfully. Your access will continue until your billing period ends.");
      
      // Refresh subscription data
      await fetchSubscription();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      toast.error(error.message || "Failed to cancel subscription. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPeriodEnd = subscription?.current_period_end 
    ? format(new Date(subscription.current_period_end), "MMMM d, yyyy")
    : "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your TaskPro subscription?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> No refund will be given for the remaining time. 
              Your subscription will remain active until <strong>{currentPeriodEnd}</strong>, 
              after which you'll lose access to premium features.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>After cancellation:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You'll keep access to premium features until {currentPeriodEnd}</li>
              <li>No future charges will be made</li>
              <li>You can resubscribe at any time</li>
              <li>Your data will be preserved</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)} 
            variant="outline"
            disabled={isProcessing}
          >
            Keep Subscription
          </Button>
          <Button 
            onClick={handleCancel}
            variant="destructive"
            disabled={isProcessing}
          >
            {isProcessing ? "Canceling..." : "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
