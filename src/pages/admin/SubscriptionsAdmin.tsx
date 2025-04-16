
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  CreditCard, 
  Check, 
  RefreshCw, 
  Users, 
  Calendar 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { SubscriptionPlan, UserSubscriptionData } from "@/types/adminTypes";
import { toast } from "sonner";

export default function SubscriptionsAdmin() {
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // For now, use sample data until we set up the actual backend tables
        const samplePlans: SubscriptionPlan[] = [
          {
            id: "1",
            name: "TaskPro Pro Monthly",
            description: "All TaskPro features with monthly billing",
            price_monthly: 3,
            price_yearly: 0,
            features: [
              "Unlimited projects and tasks",
              "Advanced filtering capabilities",
              "Priority support",
              "All premium features"
            ],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "2",
            name: "TaskPro Pro Yearly",
            description: "All TaskPro features with yearly billing (Save 16%)",
            price_monthly: 0,
            price_yearly: 30,
            features: [
              "All monthly features",
              "Save 16% compared to monthly",
              "Priority support",
              "All premium features"
            ],
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        const sampleUserSubscriptions: UserSubscriptionData[] = [
          {
            id: "1",
            user_id: "user123",
            email: "user@example.com",
            subscription_status: "active",
            plan_type: "monthly",
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_trial: false
          },
          {
            id: "2",
            user_id: "user456",
            email: "anotheruser@example.com",
            subscription_status: "trial",
            plan_type: "monthly",
            start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_trial: true
          },
          {
            id: "3",
            user_id: "user789",
            email: "thirduser@example.com",
            subscription_status: "expired",
            plan_type: "yearly",
            start_date: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            is_trial: false
          },
        ];
        
        setPlans(samplePlans);
        setUserSubscriptions(sampleUserSubscriptions);
      } catch (error) {
        console.error("Error loading subscription data:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const form = useForm<SubscriptionPlan>({
    defaultValues: {
      name: "",
      description: "",
      price_monthly: 0,
      price_yearly: 0,
      features: [],
      is_active: true
    }
  });
  
  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      price_monthly: 0,
      price_yearly: 0,
      features: [],
      is_active: true
    });
    setEditingPlan(null);
  };
  
  useEffect(() => {
    if (editingPlan) {
      form.reset({
        ...editingPlan,
        features: editingPlan.features
      });
    }
  }, [editingPlan, form]);
  
  const onSubmit = async (data: SubscriptionPlan) => {
    try {
      if (editingPlan) {
        // Update existing plan
        // For now, we'll just update the state
        setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...data, id: p.id, created_at: p.created_at, updated_at: new Date().toISOString() } : p));
        toast.success("Subscription plan updated successfully");
      } else {
        // Create new plan
        const newPlan: SubscriptionPlan = {
          ...data,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPlans(prev => [...prev, newPlan]);
        toast.success("Subscription plan created successfully");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving subscription plan:", error);
      toast.error("Failed to save subscription plan");
    }
  };
  
  const handleDeletePlan = () => {
    if (editingPlan) {
      setPlans(prev => prev.filter(p => p.id !== editingPlan.id));
      toast.success("Subscription plan deleted successfully");
      setShowDeleteDialog(false);
      resetForm();
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "trial":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Trial</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const refreshData = () => {
    setLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and user subscriptions
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription Plans
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Subscriptions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Manage and configure subscription plans</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} size="sm" className="h-8">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[650px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingPlan 
                          ? "Update the details of this subscription plan" 
                          : "Configure a new subscription plan for your users"}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plan Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. TaskPro Pro Monthly" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-end space-x-3 space-y-0 pt-4">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Active</FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe the features of this plan" 
                                  className="resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="price_monthly"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Monthly Price ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    min="0" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>Set to 0 if not offering monthly</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="price_yearly"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Yearly Price ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    min="0" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormDescription>Set to 0 if not offering yearly</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="features"
                          render={() => (
                            <FormItem>
                              <FormLabel>Features (one per line)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Unlimited projects and tasks&#10;Advanced filtering&#10;Priority support" 
                                  value={form.watch("features")?.join("\n") || ""}
                                  onChange={(e) => form.setValue("features", e.target.value.split("\n"))}
                                  className="min-h-24"
                                />
                              </FormControl>
                              <FormDescription>Enter each feature on a new line</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          {editingPlan && (
                            <Button 
                              type="button" 
                              variant="destructive" 
                              onClick={() => setShowDeleteDialog(true)}
                              className="mr-auto"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Plan
                            </Button>
                          )}
                          <Button type="submit">
                            <Check className="h-4 w-4 mr-2" />
                            {editingPlan ? "Update Plan" : "Create Plan"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : plans.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No subscription plans found.</p>
                  <p>Click "Add Plan" to create your first subscription plan.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{plan.name}</div>
                              <div className="text-sm text-muted-foreground">{plan.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {plan.price_monthly > 0 && (
                                <div className="text-sm">Monthly: ${plan.price_monthly.toFixed(2)}</div>
                              )}
                              {plan.price_yearly > 0 && (
                                <div className="text-sm">Yearly: ${plan.price_yearly.toFixed(2)}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {plan.is_active ? (
                              <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-500 text-gray-500">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingPlan(plan)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[650px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Subscription Plan</DialogTitle>
                                  <DialogDescription>
                                    Update the details of this subscription plan
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                    {/* Same form fields as in Add Plan dialog */}
                                    {/* ...form fields rendered here... */}
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>User Subscriptions</CardTitle>
              <CardDescription>View and manage user subscription status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : userSubscriptions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No user subscriptions found.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">
                            {subscription.email}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(subscription.subscription_status)}
                            {subscription.is_trial && (
                              <Badge variant="outline" className="ml-2 border-blue-500 text-blue-500">Trial</Badge>
                            )}
                          </TableCell>
                          <TableCell>{subscription.plan_type}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <div className="text-sm">
                                <div>
                                  {new Date(subscription.start_date).toLocaleDateString()} to
                                </div>
                                <div>
                                  {new Date(subscription.end_date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription plan?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
