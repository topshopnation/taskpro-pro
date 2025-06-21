
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useSubscription } from "@/contexts/subscription";
import { SubscriptionCardProps } from "@/types/subscriptionTypes";
import { CurrentPlanDisplay } from "./subscription/CurrentPlanDisplay";
import { SubscriptionActions } from "./subscription/SubscriptionActions";

export default function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  const { loading, initialized } = useSubscription();

  if (!initialized || loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="animate-pulse">
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Subscription</CardTitle>
            <CardDescription className="text-xs">
              Manage your TaskPro subscription
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 px-4">
        <CurrentPlanDisplay />
      </CardContent>
      
      <CardFooter className="py-2 px-4">
        <SubscriptionActions onUpgrade={onUpgrade} />
      </CardFooter>
    </Card>
  );
}
