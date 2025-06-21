
import { Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubscriptionPlan } from "@/types/adminTypes";
import { SubscriptionPlansTable } from "./SubscriptionPlansTable";

interface SubscriptionAdminContentProps {
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPlans: SubscriptionPlan[];
  onEdit: (plan: SubscriptionPlan) => void;
  onDuplicate: (plan: SubscriptionPlan) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionAdminContent({
  loading,
  searchQuery,
  setSearchQuery,
  filteredPlans,
  onEdit,
  onDuplicate,
  onDelete
}: SubscriptionAdminContentProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Subscription Plans</CardTitle>
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
            <p className="text-sm mt-2">Click "Create Plan" above to add your first subscription plan.</p>
          </div>
        ) : (
          <SubscriptionPlansTable
            plans={filteredPlans}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  );
}
