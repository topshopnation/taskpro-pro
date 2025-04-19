
import { Search, Loader2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  onCreate: () => void;
}

export function SubscriptionAdminContent({
  loading,
  searchQuery,
  setSearchQuery,
  filteredPlans,
  onEdit,
  onDuplicate,
  onDelete,
  onCreate
}: SubscriptionAdminContentProps) {
  return (
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
            <Button variant="outline" className="mt-4" onClick={onCreate}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create a new plan
            </Button>
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
