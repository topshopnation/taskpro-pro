
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Trash2 } from "lucide-react";
import { SubscriptionPlan } from "@/types/adminTypes";

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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price_monthly">Monthly Price ($)</Label>
            <Input 
              id="price_monthly" 
              type="number" 
              min="0" 
              step="0.01"
              value={currentPlan.price_monthly || 0} 
              onChange={(e) => setCurrentPlan({...currentPlan, price_monthly: parseFloat(e.target.value)})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price_yearly">Yearly Price ($)</Label>
            <Input 
              id="price_yearly" 
              type="number" 
              min="0" 
              step="0.01"
              value={currentPlan.price_yearly || 0} 
              onChange={(e) => setCurrentPlan({...currentPlan, price_yearly: parseFloat(e.target.value)})}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Features</Label>
          <div className="flex gap-2">
            <Input 
              value={newFeature} 
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <Button type="button" onClick={handleAddFeature}>Add</Button>
          </div>
          
          <div className="mt-2 space-y-2">
            {currentPlan.features?.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="flex-1 text-sm">{feature}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFeature(index)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
            
            {(currentPlan.features?.length || 0) === 0 && (
              <div className="text-sm text-muted-foreground italic py-2">
                No features added yet
              </div>
            )}
          </div>
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
