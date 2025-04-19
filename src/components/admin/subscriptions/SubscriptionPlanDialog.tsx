
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { SubscriptionPlan } from "@/types/adminTypes";
import { FeaturesList } from "./dialog/FeaturesList";
import { PriceInputs } from "./dialog/PriceInputs";
import { FeatureInput } from "./dialog/FeatureInput";

interface SubscriptionPlanDialogContentProps {
  currentPlan: Partial<SubscriptionPlan>;
  setCurrentPlan: (plan: Partial<SubscriptionPlan>) => void;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  setDialogOpen: (open: boolean) => void;
}

export function SubscriptionPlanDialogContent({
  currentPlan,
  setCurrentPlan,
  isEditing,
  onSubmit,
  setDialogOpen
}: SubscriptionPlanDialogContentProps) {
  const [newFeature, setNewFeature] = useState("");

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setCurrentPlan({
      ...currentPlan,
      features: [...(currentPlan.features || []), newFeature.trim()]
    });
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setCurrentPlan({
      ...currentPlan,
      features: currentPlan.features?.filter((_, i) => i !== index)
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input 
            id="name" 
            value={currentPlan.name || ""} 
            onChange={(e) => setCurrentPlan({...currentPlan, name: e.target.value})}
            placeholder="Pro Plan"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={currentPlan.description || ""} 
            onChange={(e) => setCurrentPlan({...currentPlan, description: e.target.value})}
            placeholder="Advanced features for power users"
            rows={2}
          />
        </div>
        
        <PriceInputs 
          monthlyPrice={currentPlan.price_monthly || 0}
          yearlyPrice={currentPlan.price_yearly || 0}
          onMonthlyPriceChange={(price) => setCurrentPlan({...currentPlan, price_monthly: price})}
          onYearlyPriceChange={(price) => setCurrentPlan({...currentPlan, price_yearly: price})}
        />
        
        <div className="space-y-2">
          <Label>Features</Label>
          <FeatureInput 
            newFeature={newFeature}
            onFeatureChange={setNewFeature}
            onAddFeature={handleAddFeature}
          />
          
          <FeaturesList 
            features={currentPlan.features || []}
            onRemoveFeature={handleRemoveFeature}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="is_active"
            checked={currentPlan.is_active}
            onCheckedChange={(checked) => setCurrentPlan({...currentPlan, is_active: checked})}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? "Update Plan" : "Create Plan"}
        </Button>
      </DialogFooter>
    </form>
  );
}
