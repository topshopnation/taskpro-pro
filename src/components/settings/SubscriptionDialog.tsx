
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, BadgeCheck, Clock, Banknote } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/contexts/subscription-context";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("paypal");
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { updateSubscription, isTrialActive } = useSubscription();

  const handleSubscribe = async () => {
    setIsProcessing(true);
    toast.info("Processing payment...");
    
    try {
      // In a real implementation, this would call a payment processor
      // For now, we'll simulate a successful payment
      setTimeout(async () => {
        try {
          // Update the subscription in the database
          await updateSubscription(planType);
          
          toast.success("Subscription activated!", { 
            description: "Thank you for your support."
          });
          onOpenChange(false);
        } catch (error) {
          console.error("Error updating subscription:", error);
          toast.error("Could not update subscription", {
            description: "Please try again or contact support."
          });
        } finally {
          setIsProcessing(false);
        }
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      toast.error("Payment processing failed", {
        description: "Please try again or contact support."
      });
    }
  };

  const getPaymentInstructions = () => {
    switch (paymentMethod) {
      case "paypal":
        return "You'll be redirected to PayPal to complete your payment to 'payments@taskpro.pro'.";
      case "venmo":
        return "Send payment to @taskpro-app on Venmo and include your email in the note.";
      case "applepay":
        return "Complete your payment using Apple Pay on supported devices.";
      default:
        return "";
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade to TaskPro Pro</DialogTitle>
          <DialogDescription>
            Get unlimited access to all premium features
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="plans" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="plans">Select Plan</TabsTrigger>
            <TabsTrigger value="payment">Payment Method</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans" className="py-4 space-y-4">
            <div className="space-y-4">
              <RadioGroup value={planType} onValueChange={(v) => setPlanType(v as "monthly" | "yearly")}>
                <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <div className="flex-1 pl-2">
                    <Label htmlFor="monthly" className="font-medium">Monthly Plan</Label>
                    <p className="text-sm text-muted-foreground">$3.00 per month</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">$3.00</span>
                    <p className="text-xs text-muted-foreground">billed monthly</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <div className="flex-1 pl-2">
                    <Label htmlFor="yearly" className="font-medium flex items-center">
                      Yearly Plan 
                      <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                        Save 16%
                      </Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground">$30.00 per year ($2.50/month)</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">$30.00</span>
                    <p className="text-xs text-muted-foreground">billed annually</p>
                  </div>
                </div>
              </RadioGroup>
              
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Unlimited projects and tasks</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Advanced filtering and sorting</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Theme customization</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="py-4 space-y-4">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="paypal" id="paypal" />
                <div className="flex-1 pl-2">
                  <Label htmlFor="paypal" className="font-medium">PayPal</Label>
                  <p className="text-sm text-muted-foreground">Pay securely with PayPal</p>
                </div>
                <div className="h-8 w-14 bg-[#003087] text-white rounded flex items-center justify-center">
                  <span className="font-bold text-sm">PayPal</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="venmo" id="venmo" />
                <div className="flex-1 pl-2">
                  <Label htmlFor="venmo" className="font-medium">Venmo</Label>
                  <p className="text-sm text-muted-foreground">Send money via Venmo</p>
                </div>
                <div className="h-8 w-14 bg-[#3D95CE] text-white rounded flex items-center justify-center">
                  <span className="font-bold text-sm">Venmo</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted">
                <RadioGroupItem value="applepay" id="applepay" />
                <div className="flex-1 pl-2">
                  <Label htmlFor="applepay" className="font-medium">Apple Pay</Label>
                  <p className="text-sm text-muted-foreground">Pay using Apple Pay</p>
                </div>
                <div className="h-8 w-14 bg-black text-white rounded flex items-center justify-center">
                  <span className="font-bold text-xs">Apple Pay</span>
                </div>
              </div>
            </RadioGroup>
            
            <div className="bg-muted p-4 rounded-md mt-4">
              <h4 className="font-medium flex items-center">
                <Banknote className="h-4 w-4 mr-2" />
                Payment Instructions
              </h4>
              <p className="text-sm mt-2">{getPaymentInstructions()}</p>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between font-medium">
                <span>Total amount</span>
                <span>{planType === "monthly" ? "$3.00" : "$30.00"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {planType === "monthly" ? "Billed monthly" : "Billed annually"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubscribe} 
            disabled={isProcessing}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {isTrialActive ? "Upgrade Now" : "Subscribe Now"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
