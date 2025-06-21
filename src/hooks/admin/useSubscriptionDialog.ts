
import { useState } from "react";
import { SubscriptionPlan } from "@/types/adminTypes";
import { subscriptionPlansService } from "@/services/admin/subscription-plans-service";
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
    
    console.log("Form submitted with plan:", currentPlan);
    
    if (!currentPlan.name?.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (currentPlan.price_monthly === undefined || currentPlan.price_monthly <= 0) {
      toast.error("Monthly price must be greater than 0");
      return;
    }

    if (currentPlan.price_yearly === undefined || currentPlan.price_yearly <= 0) {
      toast.error("Yearly price must be greater than 0");
      return;
    }
    
    try {
      if (isEditing && currentPlan.id) {
        console.log("Updating plan with ID:", currentPlan.id);
        const success = await subscriptionPlansService.updateSubscriptionPlan(currentPlan.id, currentPlan);
        if (success) {
          toast.success("Subscription plan updated successfully");
          setDialogOpen(false);
          // Convert the plan to proper SubscriptionPlan type for callback
          const updatedPlan: SubscriptionPlan = {
            ...success,
            features: Array.isArray(success.features) 
              ? success.features.filter((feature): feature is string => typeof feature === 'string')
              : []
          };
          onSuccess(updatedPlan);
        } else {
          toast.error("Failed to update subscription plan");
          return;
        }
      } else {
        console.log("Creating new plan:", currentPlan);
        // Ensure we have all required fields for creation
        const planToCreate = {
          name: currentPlan.name!,
          description: currentPlan.description || "",
          price_monthly: currentPlan.price_monthly!,
          price_yearly: currentPlan.price_yearly!,
          features: currentPlan.features || [],
          is_active: currentPlan.is_active ?? true
        };
        
        const newPlan = await subscriptionPlansService.createSubscriptionPlan(planToCreate);
        if (newPlan) {
          toast.success("Subscription plan created successfully");
          // Convert the plan to proper SubscriptionPlan type for callback
          const createdPlan: SubscriptionPlan = {
            ...newPlan,
            features: Array.isArray(newPlan.features) 
              ? newPlan.features.filter((feature): feature is string => typeof feature === 'string')
              : []
          };
          onSuccess(createdPlan);
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
