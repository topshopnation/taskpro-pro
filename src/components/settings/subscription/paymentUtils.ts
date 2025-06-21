
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlanType } from "@/types/subscriptionTypes";

export const createTrialSubscription = async (userId: string): Promise<boolean> => {
  try {
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'trial',
        plan_type: 'monthly',
        trial_start_date: trialStart.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        current_period_start: trialStart.toISOString(),
        current_period_end: trialEnd.toISOString()
      });

    if (error) {
      console.error('Error creating trial subscription:', error);
      return false;
    }

    console.log('Trial subscription created successfully');
    return true;
  } catch (error) {
    console.error('Error in createTrialSubscription:', error);
    return false;
  }
};

export const createPaymentUrl = async (planType: SubscriptionPlanType, userId: string): Promise<string | null> => {
  try {
    console.log("Creating payment URL for plan:", planType, "user:", userId);
    
    if (!userId) {
      console.error("No user ID provided for payment URL creation");
      return null;
    }

    // For testing purposes, simulate a PayPal payment
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode - simulating payment");
      
      // Store test payment data with updated pricing
      const testPaymentData = {
        planType,
        userId,
        amount: planType === 'yearly' ? 15.00 : 2.00,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('taskpro_test_payment', JSON.stringify(testPaymentData));
      
      // Redirect to settings page to simulate returning from PayPal
      setTimeout(() => {
        window.location.href = '/settings?payment_success=true&plan=' + planType;
      }, 1000);
      
      return `https://sandbox.paypal.com/test?client-id=test&plan=${planType}&user=${userId}`;
    }

    // In production, you would integrate with actual PayPal API
    return `https://paypal.com/checkout?plan=${planType}&user=${userId}`;
  } catch (error) {
    console.error('Error creating payment URL:', error);
    return null;
  }
};
