
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeCheck, CreditCard, PaypalIcon } from "lucide-react"
import { PaypalIcon as PaypalLogo } from "lucide-react"
import { toast } from "sonner"

export default function PaymentMethodsCard() {
  const [isAddingPayment, setIsAddingPayment] = useState(false)
  
  const handleAddPaypal = () => {
    // In a real implementation, this would redirect to PayPal
    toast.success("Redirecting to PayPal...")
    
    // Simulate a successful connection
    setTimeout(() => {
      setIsAddingPayment(false)
      toast.success("PayPal account connected successfully")
    }, 1500)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods for TaskPro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingPayment ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <div className="flex items-center gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M19 5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2V5z"/>
                  <path d="M8.5 17h7"/>
                  <circle cx="12" cy="13" r="1"/>
                </svg>
                <h4 className="font-medium">Connect with PayPal</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                You'll be redirected to PayPal to connect your account.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingPayment(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPaypal}>
                  Connect PayPal
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No payment methods</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a payment method to subscribe to TaskPro Pro
            </p>
            <Button onClick={() => setIsAddingPayment(true)}>
              Add Payment Method
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
