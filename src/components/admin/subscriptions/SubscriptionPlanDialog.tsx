
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { SubscriptionPlan } from "@/types/adminTypes";
import { FeaturesList } from "./dialog/FeaturesList";
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

  const formatPriceInput = (value: string) => {
    // Remove non-digit characters except decimal point
    let cleanValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleanValue;
  };

  const handlePriceChange = (field: 'price_monthly' | 'price_yearly', value: string) => {
    const formattedValue = formatPriceInput(value);
    setCurrentPlan({
      ...currentPlan,
      [field]: formattedValue === '' ? 0 : parseFloat(formattedValue)
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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price_monthly">Monthly Price ($)</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <Input 
                id="price_monthly"
                type="text"
                className="pl-7"
                value={currentPlan.price_monthly?.toString() || "0"}
                onChange={(e) => handlePriceChange('price_monthly', e.target.value)}
                placeholder="9.99"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price_yearly">Yearly Price ($)</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <Input 
                id="price_yearly"
                type="text"
                className="pl-7" 
                value={currentPlan.price_yearly?.toString() || "0"}
                onChange={(e) => handlePriceChange('price_yearly', e.target.value)}
                placeholder="99.99"
                required
              />
            </div>
            {currentPlan.price_monthly && currentPlan.price_yearly && (
              <div className="text-xs text-muted-foreground mt-1">
                {currentPlan.price_monthly > 0 && (
                  <>
                    {Math.round(((currentPlan.price_monthly * 12 - currentPlan.price_yearly) / (currentPlan.price_monthly * 12)) * 100)}% 
                    savings compared to monthly
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
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
