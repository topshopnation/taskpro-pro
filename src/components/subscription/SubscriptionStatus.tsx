
import { useSubscription } from "@/contexts/subscription";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function SubscriptionStatus() {
  // Don't render anything - removing the trial badge display
  return null;
}
