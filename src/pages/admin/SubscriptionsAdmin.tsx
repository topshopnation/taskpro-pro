
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlan } from "@/types/adminTypes";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SubscriptionsAdmin() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setCurrentPlan({
      name: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      features: [],
      is_active: true
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setCurrentPlan({...plan});
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSavePlan = async () => {
    try {
      if (!currentPlan.name || !currentPlan.description) {
        toast.error('Name and description are required');
        return;
      }

      if (isEditing && currentPlan.id) {
        // Update existing plan
        const { error } = await supabase
          .from('subscription_plans')
          .update({
            name: currentPlan.name,
            description: currentPlan.description,
            price_monthly: currentPlan.price_monthly,
            price_yearly: currentPlan.price_yearly,
            features: currentPlan.features,
            is_active: currentPlan.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentPlan.id);

        if (error) throw error;
        toast.success('Subscription plan updated successfully');
      } else {
        // Create new plan
        const { error } = await supabase
          .from('subscription_plans')
          .insert({
            name: currentPlan.name,
            description: currentPlan.description,
            price_monthly: currentPlan.price_monthly,
            price_yearly: currentPlan.price_yearly,
            features: currentPlan.features || [],
            is_active: currentPlan.is_active
          });

        if (error) throw error;
        toast.success('Subscription plan created successfully');
      }

      setIsDialogOpen(false);
      fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error saving subscription plan:', error);
      toast.error('Failed to save subscription plan');
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setCurrentPlan(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFeaturesChange = (value: string) => {
    const featuresArray = value.split('\n').filter(f => f.trim() !== '');
    setCurrentPlan(prev => ({
      ...prev,
      features: featuresArray
    }));
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Subscription plan deleted successfully');
      fetchSubscriptionPlans();
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      toast.error('Failed to delete subscription plan');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <Button onClick={handleCreatePlan}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Yearly Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No subscription plans found. Create your first plan.
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>${plan.price_monthly.toFixed(2)}</TableCell>
                    <TableCell>${plan.price_yearly.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "outline"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPlan(plan)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={currentPlan.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Pro Plan"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentPlan.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the plan"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                  <Input
                    id="price_monthly"
                    type="number"
                    value={currentPlan.price_monthly || ''}
                    onChange={(e) => handleInputChange('price_monthly', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price_yearly">Yearly Price ($)</Label>
                  <Input
                    id="price_yearly"
                    type="number"
                    value={currentPlan.price_yearly || ''}
                    onChange={(e) => handleInputChange('price_yearly', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={(currentPlan.features || []).join('\n')}
                  onChange={(e) => handleFeaturesChange(e.target.value)}
                  placeholder="Unlimited projects&#10;Priority support&#10;Advanced reporting"
                  rows={5}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={currentPlan.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlan}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
