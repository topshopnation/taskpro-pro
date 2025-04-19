
import { Button } from "@/components/ui/button";
import { RefreshCw, PlusCircle } from "lucide-react";

interface SubscriptionAdminHeaderProps {
  onRefresh: () => void;
  onCreate: () => void;
  loading: boolean;
}

export function SubscriptionAdminHeader({ onRefresh, onCreate, loading }: SubscriptionAdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Manage subscription plans and pricing
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button onClick={onCreate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>
    </div>
  );
}
