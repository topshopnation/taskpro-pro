
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { SubscriptionPlan } from "@/types/adminTypes";
import { adminService } from "@/services/admin-service";
import { Loader2, PlusCircle, Search, RefreshCw, Edit, Trash2, Copy, MoreHorizontal, CheckCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";

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
  const [newFeature, setNewFeature] = useState("");
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const subscriptionPlans = await adminService.getSubscriptionPlans();
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
  
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    
    setCurrentPlan(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeature.trim()]
    }));
    
    setNewFeature("");
  };
  
  const handleRemoveFeature = (index: number) => {
    setCurrentPlan(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index)
    }));
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
        
        // Update the plan in the local state
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
      
      // Remove the plan from the local state
      setPlans(prev => prev.filter(plan => plan.id !== deleteId));
      
      toast.success("Subscription plan deleted");
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete subscription plan");
    }
  };
  
  const initiateDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Yearly Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {plan.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${plan.price_monthly.toFixed(2)}</TableCell>
                    <TableCell>${plan.price_yearly.toFixed(2)}</TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(plan.created_at), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const duplicate = {...plan, name: `${plan.name} (Copy)`, id: undefined};
                            setCurrentPlan(duplicate);
                            setIsEditing(false);
                            setDialogOpen(true);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => initiateDelete(plan.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Create/Edit Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the details of this subscription plan." : "Create a new subscription plan for your users."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
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
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-destructive">
              Warning: Users with this plan will not have their subscription changed automatically.
              You may need to migrate them to a different plan manually.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
            >
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
