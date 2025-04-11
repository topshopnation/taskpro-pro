
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/subscription-context";
import { CalendarDays, Check, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "venmo" | "applepay">("paypal");
  const { updateSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      // In a production app, here you would handle the payment processing
      // For now we'll just simulate a successful payment
      
      // Calculate the new period end date based on plan type
      const currentDate = new Date();
      const periodEnd = new Date(currentDate);
      
      if (planType === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }
      
      // Update the subscription in the database
      await updateSubscription({
        status: "active",
        planType,
        currentPeriodStart: currentDate.toISOString(),
        currentPeriodEnd: periodEnd.toISOString()
      });
      
      toast.success(`Successfully upgraded to ${planType} plan`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const openPaymentLink = () => {
    let paymentUrl = "";
    
    if (paymentMethod === "paypal") {
      const amount = planType === "monthly" ? "9.99" : "99.99";
      const description = `TaskPro ${planType} subscription`;
      paymentUrl = `https://www.paypal.com/paypalme/payments@taskpro.pro/${amount}?description=${encodeURIComponent(description)}`;
    } else if (paymentMethod === "venmo") {
      paymentUrl = "https://venmo.com/taskpro-app";
    } else if (paymentMethod === "applepay") {
      // In a real implementation, Apple Pay would be handled differently
      // This is just a placeholder for now
      toast.info("Apple Pay is not yet implemented");
      return;
    }
    
    // Open payment link in a new window
    if (paymentUrl) {
      window.open(paymentUrl, "_blank");
      toast.info("After completing payment, return here to activate your subscription");
    }
  };
  
  const getPriceDisplay = () => {
    if (planType === "monthly") {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold">$9.99<span className="text-sm font-normal">/month</span></span>
          <Badge variant="outline" className="mt-2 w-fit">
            Billed monthly
          </Badge>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold">$99.99<span className="text-sm font-normal">/year</span></span>
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
                  <p className="text-xl font-bold">$9.99<span className="text-sm font-normal">/mo</span></p>
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
                  <p className="text-xl font-bold">$99.99<span className="text-sm font-normal">/yr</span></p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-base">Payment method</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as "paypal" | "venmo" | "applepay")}
              className="grid gap-2 mt-2"
            >
              <div className={`flex items-center p-3 border rounded-lg ${paymentMethod === "paypal" ? "border-primary" : ""}`}>
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex items-center pl-2 cursor-pointer">
                  <div className="w-8 h-8 mr-2 flex items-center justify-center">
                    <img src="https://cdn.cdnlogo.com/logos/p/42/paypal.svg" alt="PayPal" className="h-6" />
                  </div>
                  <span>PayPal</span>
                </Label>
              </div>
              
              <div className={`flex items-center p-3 border rounded-lg ${paymentMethod === "venmo" ? "border-primary" : ""}`}>
                <RadioGroupItem value="venmo" id="venmo" />
                <Label htmlFor="venmo" className="flex items-center pl-2 cursor-pointer">
                  <div className="w-8 h-8 mr-2 flex items-center justify-center">
                    <img src="https://cdn.cdnlogo.com/logos/v/81/venmo.svg" alt="Venmo" className="h-6" />
                  </div>
                  <span>Venmo</span>
                </Label>
              </div>
              
              <div className={`flex items-center p-3 border rounded-lg ${paymentMethod === "applepay" ? "border-primary" : ""}`}>
                <RadioGroupItem value="applepay" id="applepay" />
                <Label htmlFor="applepay" className="flex items-center pl-2 cursor-pointer">
                  <div className="w-8 h-8 mr-2 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span>Apple Pay</span>
                </Label>
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
            {isProcessing ? "Processing..." : `Pay with ${paymentMethod === "paypal" ? "PayPal" : paymentMethod === "venmo" ? "Venmo" : "Apple Pay"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
