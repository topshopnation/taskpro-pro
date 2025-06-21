
-- Add paypal_subscription_id column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN paypal_subscription_id TEXT;

-- Add index for better performance when looking up by PayPal subscription ID
CREATE INDEX idx_subscriptions_paypal_subscription_id 
ON public.subscriptions(paypal_subscription_id);
