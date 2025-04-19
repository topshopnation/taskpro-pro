
import { useState } from "react";
import { SubscriptionPlan } from "@/types/adminTypes";
import { adminService } from "@/services/admin-service";
import { toast } from "sonner";

export function useSubscriptionDialog(onSuccess: (plan: SubscriptionPlan) => void) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan>>({
    name: "",
    description: "",
    price_monthly: 0,
    price_yearly: 0,
    features: [],
    is_active: true
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPlan.name) {
      toast.error("Plan name is required");
      return;
    }
    
    try {
      if (isEditing && currentPlan.id) {
        await adminService.updateSubscriptionPlan(currentPlan.id, currentPlan);
        toast.success("Subscription plan updated");
      } else {
        const newPlan = await adminService.createSubscriptionPlan(currentPlan);
        if (newPlan) {
          toast.success("Subscription plan created");
          onSuccess(newPlan);
        }
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save subscription plan");
    }
  };

  return {
    dialogOpen,
    setDialogOpen,
    isEditing,
    setIsEditing,
    currentPlan,
    setCurrentPlan,
    handleFormSubmit
  };
}
