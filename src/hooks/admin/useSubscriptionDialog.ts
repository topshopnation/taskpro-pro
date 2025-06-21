
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
    
    if (!currentPlan.name?.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (currentPlan.price_monthly === undefined || currentPlan.price_monthly < 0) {
      toast.error("Monthly price must be a valid number");
      return;
    }

    if (currentPlan.price_yearly === undefined || currentPlan.price_yearly < 0) {
      toast.error("Yearly price must be a valid number");
      return;
    }
    
    try {
      if (isEditing && currentPlan.id) {
        const success = await adminService.updateSubscriptionPlan(currentPlan.id, currentPlan);
        if (success) {
          toast.success("Subscription plan updated successfully");
          setDialogOpen(false);
        } else {
          toast.error("Failed to update subscription plan");
          return;
        }
      } else {
        const newPlan = await adminService.createSubscriptionPlan(currentPlan);
        if (newPlan) {
          toast.success("Subscription plan created successfully");
          onSuccess(newPlan);
          setDialogOpen(false);
        } else {
          toast.error("Failed to create subscription plan");
          return;
        }
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(`Failed to save subscription plan: ${errorMessage}`);
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
