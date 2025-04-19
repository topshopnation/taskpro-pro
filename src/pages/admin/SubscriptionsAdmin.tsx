
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { SubscriptionPlan } from "@/types/adminTypes";
import { adminService } from "@/services/admin-service";
import { Loader2, PlusCircle, Search, RefreshCw } from "lucide-react";
import { SubscriptionPlanDialogContent } from "@/components/admin/subscriptions/SubscriptionPlanDialog";
import { DeletePlanDialog } from "@/components/admin/subscriptions/DeletePlanDialog";
import { SubscriptionPlansTable } from "@/components/admin/subscriptions/SubscriptionPlansTable";
import { supabase } from "@/integrations/supabase/client";

export default function SubscriptionsAdmin() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<SubscriptionPlan>>({
    name: "",
    description: "",
    price_monthly: 0,
    price_yearly: 0,
    features: [],
    is_active: true
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data: subscriptionPlans, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPlans(subscriptionPlans);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
        toast.error("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter(
    plan => plan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const refreshedPlans = await adminService.getSubscriptionPlans();
      setPlans(refreshedPlans);
      toast.success("Subscription plans refreshed");
    } catch (error) {
      console.error("Error refreshing plans:", error);
      toast.error("Failed to refresh plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setCurrentPlan({
      name: "",
      description: "",
      price_monthly: 0,
      price_yearly: 0,
      features: [],
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setIsEditing(true);
    setCurrentPlan({...plan});
    setDialogOpen(true);
  };

  const handleDuplicate = (plan: SubscriptionPlan) => {
    const duplicate = {...plan, name: `${plan.name} (Copy)`, id: undefined};
    setCurrentPlan(duplicate);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPlan.name) {
      toast.error("Plan name is required");
      return;
    }
    
    try {
      if (isEditing && currentPlan.id) {
        await adminService.updateSubscriptionPlan(currentPlan.id, currentPlan);
        setPlans(prev => prev.map(plan => 
          plan.id === currentPlan.id ? {...plan, ...currentPlan} as SubscriptionPlan : plan
        ));
        toast.success("Subscription plan updated");
      } else {
        const newPlan = await adminService.createSubscriptionPlan(currentPlan);
        if (newPlan) {
          setPlans(prev => [...prev, newPlan]);
          toast.success("Subscription plan created");
        }
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save subscription plan");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await adminService.deleteSubscriptionPlan(deleteId);
      setPlans(prev => prev.filter(plan => plan.id !== deleteId));
      toast.success("Subscription plan deleted");
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete subscription plan");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Plans</CardTitle>
          <CardDescription>
            Manage subscription plans and pricing tiers
          </CardDescription>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search plans..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No subscription plans found.</p>
              <Button variant="outline" className="mt-4" onClick={handleCreate}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create a new plan
              </Button>
            </div>
          ) : (
            <SubscriptionPlansTable
              plans={filteredPlans}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={(id) => {
                setDeleteId(id);
                setDeleteDialogOpen(true);
              }}
            />
          )}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the details of this subscription plan." : "Create a new subscription plan for your users."}
            </DialogDescription>
          </DialogHeader>
          
          <SubscriptionPlanDialogContent
            currentPlan={currentPlan}
            setCurrentPlan={setCurrentPlan}
            isEditing={isEditing}
            onSubmit={handleFormSubmit}
            setDialogOpen={setDialogOpen}
          />
        </DialogContent>
      </Dialog>
      
      <DeletePlanDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
