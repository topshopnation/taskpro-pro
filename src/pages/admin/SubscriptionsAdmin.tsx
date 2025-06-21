
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { SubscriptionPlan } from "@/types/adminTypes";
import { Dialog } from "@/components/ui/dialog";
import { DeletePlanDialog } from "@/components/admin/subscriptions/DeletePlanDialog";
import { SubscriptionPlanDialogContent } from "@/components/admin/subscriptions/SubscriptionPlanDialog";
import { useSubscriptionPlans } from "@/hooks/admin/useSubscriptionPlans";
import { useSubscriptionDialog } from "@/hooks/admin/useSubscriptionDialog";
import { SubscriptionAdminHeader } from "@/components/admin/subscriptions/SubscriptionAdminHeader";
import { SubscriptionAdminContent } from "@/components/admin/subscriptions/SubscriptionAdminContent";
import { adminService } from "@/services/admin-service";
import { toast } from "sonner";

export default function SubscriptionsAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { plans, setPlans, loading, fetchPlans } = useSubscriptionPlans();
  const { 
    dialogOpen, 
    setDialogOpen, 
    isEditing, 
    setIsEditing, 
    currentPlan, 
    setCurrentPlan, 
    handleFormSubmit 
  } = useSubscriptionDialog((newPlan) => {
    setPlans(prev => [...prev, newPlan]);
    fetchPlans(); // Refresh the list after adding
  });

  const filteredPlans = plans.filter(
    plan => plan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const success = await adminService.deleteSubscriptionPlan(deleteId);
      if (success) {
        setPlans(prev => prev.filter(plan => plan.id !== deleteId));
        toast.success("Subscription plan deleted successfully");
      } else {
        toast.error("Failed to delete subscription plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete subscription plan");
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleFormSubmitWithRefresh = async (e: React.FormEvent) => {
    await handleFormSubmit(e);
    // Refresh the plans list after successful creation/update
    fetchPlans();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <SubscriptionAdminHeader 
          onRefresh={fetchPlans}
          onCreate={handleCreate}
          loading={loading}
        />
        
        <SubscriptionAdminContent 
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredPlans={filteredPlans}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={(id) => {
            setDeleteId(id);
            setDeleteDialogOpen(true);
          }}
        />
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <SubscriptionPlanDialogContent
            currentPlan={currentPlan}
            setCurrentPlan={setCurrentPlan}
            isEditing={isEditing}
            onSubmit={handleFormSubmitWithRefresh}
            setDialogOpen={setDialogOpen}
          />
        </Dialog>
        
        <DeletePlanDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirmDelete={handleConfirmDelete}
        />
      </div>
    </AdminLayout>
  );
}
