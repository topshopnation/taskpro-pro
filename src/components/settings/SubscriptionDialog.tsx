
import { useSubscription } from "@/contexts/subscription";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Check, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const { updateSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  
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
      // Calculate the new period end date based on plan type
      const currentDate = new Date();
      const periodEnd = new Date(currentDate);
      
      if (paymentType === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }
      
      // Update the subscription in the database
      await updateSubscription({
        status: "active",
        planType: paymentType,
        currentPeriodStart: currentDate.toISOString(),
        currentPeriodEnd: periodEnd.toISOString()
      });
      
      toast.success(`Successfully upgraded to ${paymentType} plan`);
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
    let paymentUrl = "";
    
    if (planType === "monthly") {
      paymentUrl = "https://www.paypal.com/ncp/payment/CGBFJLX2VMHCA";
    } else if (planType === "yearly") {
      paymentUrl = "https://www.paypal.com/ncp/payment/G226AU9Q5AW2S";
    }
    
    // Append return parameters to track payment type
    paymentUrl += `?return=${encodeURIComponent(window.location.origin + window.location.pathname + "?payment_success=true&plan_type=" + planType)}`;
    
    // Open payment link in a new window
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
      toast.info("After completing payment, return to this page to activate your subscription");
    }
  };
  
  const getPriceDisplay = () => {
    if (planType === "monthly") {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold">$3.00<span className="text-sm font-normal">/month</span></span>
          <Badge variant="outline" className="mt-2 w-fit">
            Billed monthly
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold">$30.00<span className="text-sm font-normal">/year</span></span>
          <Badge variant="secondary" className="mt-2 w-fit">
            Save 16%
          </Badge>
        </div>
      );
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
          <div>
            <Label className="text-base">Choose a plan</Label>
            <RadioGroup 
              value={planType} 
              onValueChange={(value) => setPlanType(value as "monthly" | "yearly")}
              className="grid grid-cols-2 gap-4 mt-2"
            >
              <div className={`flex flex-col p-4 border rounded-lg ${planType === "monthly" ? "border-primary" : ""}`}>
                <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                <Label htmlFor="monthly" className="flex justify-between items-start cursor-pointer">
                  <div>
                    <h3 className="font-medium">Monthly</h3>
                    <p className="text-sm text-muted-foreground">Flexible month-to-month</p>
                  </div>
                  {planType === "monthly" && <Check className="h-5 w-5 text-primary" />}
                </Label>
                <div className="mt-auto pt-4">
                  <p className="text-xl font-bold">$3.00<span className="text-sm font-normal">/mo</span></p>
                </div>
              </div>
              
              <div className={`flex flex-col p-4 border rounded-lg ${planType === "yearly" ? "border-primary" : ""}`}>
                <RadioGroupItem value="yearly" id="yearly" className="sr-only" />
                <Label htmlFor="yearly" className="flex justify-between items-start cursor-pointer">
                  <div>
                    <h3 className="font-medium">Yearly</h3>
                    <p className="text-sm text-muted-foreground">Save 16% annually</p>
                  </div>
                  {planType === "yearly" && <Check className="h-5 w-5 text-primary" />}
                </Label>
                <div className="mt-auto pt-4">
                  <p className="text-xl font-bold">$30.00<span className="text-sm font-normal">/yr</span></p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">TaskPro {planType === "monthly" ? "Monthly" : "Annual"} Plan</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>Renews {planType === "monthly" ? "monthly" : "yearly"}</span>
                </div>
              </div>
              {getPriceDisplay()}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={openPaymentLink} disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Continue to PayPal`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
