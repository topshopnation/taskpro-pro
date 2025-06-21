
import { Subscription } from "@/contexts/subscription/types";

export type SubscriptionPlanType = 'monthly' | 'yearly' | 'none';

export interface SubscriptionCardProps {
  onUpgrade: () => void;
}

export interface SubscriptionStatusProps {
  subscription: Subscription | null;
  isTrialActive: boolean;
  daysRemaining: number;
  formattedExpiryDate: string | null;
  error?: string | null;
}

export interface SubscriptionFeatureItem {
  text: string;
  tooltip?: string;
}

export interface PlanSelectorProps {
  planType: SubscriptionPlanType;
  onPlanTypeChange: (value: SubscriptionPlanType) => void;
}

export interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface UseSubscriptionCardReturn {
  subscription: Subscription | null;
  isTrialActive: boolean;
  daysRemaining: number;
  formattedExpiryDate: string | null;
  hasRendered: boolean;
  isStable: boolean;
  showRenewButton: boolean;
  error: string | null;
  isSubscriptionActive: boolean;
}
