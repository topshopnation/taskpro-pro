
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, BadgeCheck } from "lucide-react"
import { toast } from "sonner"

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const handleSubscribe = () => {
    toast.success("Redirecting to payment processor...")
    setTimeout(() => {
      onOpenChange(false)
      toast.success("Subscription activated! Thank you for your support.")
    }, 1500)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to TaskPro Pro</DialogTitle>
          <DialogDescription>
            Get unlimited access to all premium features for only $4.99/month
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="font-medium">TaskPro Pro</div>
              <div className="font-medium">$4.99/month</div>
            </div>
            <ul className="space-y-2">
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
            </ul>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Cancel anytime. No long-term commitment required.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button type="button" onClick={handleSubscribe}>
            <CreditCard className="mr-2 h-4 w-4" />
            Subscribe Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
