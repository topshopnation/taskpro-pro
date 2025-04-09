
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SubscriptionCardProps {
  onUpgrade: () => void;
}

export default function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Manage your TaskPro subscription
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto">
            <BadgeCheck className="h-3 w-3 mr-1 text-amber-500" /> Free Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border rounded-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">TaskPro Pro</h4>
              <p className="text-sm text-muted-foreground">
                Unlock all premium features
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">$4.99</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Unlimited projects and tasks</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Advanced filtering and sorting</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Priority customer support</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Theme customization</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={onUpgrade}>
          <CreditCard className="mr-2 h-4 w-4" />
          Upgrade to Pro
        </Button>
      </CardFooter>
    </Card>
  )
}
