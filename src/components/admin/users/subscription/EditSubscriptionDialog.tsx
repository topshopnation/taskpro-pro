
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserProfile } from "@/types/adminTypes";
import { SubscriptionForm } from "./SubscriptionForm";

interface EditSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess?: () => void;
}

export function EditSubscriptionDialog({ open, onOpenChange, user, onSuccess }: EditSubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update subscription details for {user?.first_name} {user?.last_name}
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm 
          open={open} 
          onOpenChange={onOpenChange} 
          user={user} 
          onSuccess={onSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
}
