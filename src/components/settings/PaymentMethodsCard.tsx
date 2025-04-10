
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function PaymentMethodsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">PayPal</p>
              <p className="text-sm text-muted-foreground">Connect your PayPal account</p>
            </div>
          </div>
          <Button variant="outline">Connect</Button>
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-md border-dashed">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Credit Card</p>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
          <Badge variant="outline" className="text-muted-foreground">Coming Soon</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
