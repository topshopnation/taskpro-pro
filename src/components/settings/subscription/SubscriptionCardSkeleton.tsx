
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function SubscriptionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">Subscription</CardTitle>
        <CardDescription className="text-xs">Loading subscription...</CardDescription>
      </CardHeader>
      <CardContent className="py-2 px-4 space-y-3">
        <div className="h-32 flex flex-col items-center justify-center">
          <div className="animate-pulse bg-primary/10 h-4 w-5/6 rounded mb-2"></div>
          <div className="animate-pulse bg-primary/10 h-4 w-3/6 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}
