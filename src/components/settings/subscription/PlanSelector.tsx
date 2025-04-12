
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";

interface PlanSelectorProps {
  planType: "monthly" | "yearly";
  onPlanTypeChange: (value: "monthly" | "yearly") => void;
}

export default function PlanSelector({ planType, onPlanTypeChange }: PlanSelectorProps) {
  return (
    <div>
      <Label className="text-base">Choose a plan</Label>
      <RadioGroup 
        value={planType} 
        onValueChange={(value) => onPlanTypeChange(value as "monthly" | "yearly")}
        className="grid grid-cols-2 gap-4 mt-2"
      >
        <div className={`flex flex-col p-4 border rounded-lg cursor-pointer ${planType === "monthly" ? "border-primary" : ""}`}
             onClick={() => onPlanTypeChange("monthly")}>
          <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
          <Label htmlFor="monthly" className="flex justify-between items-start cursor-pointer">
            <div>
              <h3 className="font-medium">Monthly</h3>
              <p className="text-sm text-muted-foreground">Flexible payment</p>
            </div>
            {planType === "monthly" && <Check className="h-5 w-5 text-primary" />}
          </Label>
          <div className="mt-auto pt-4">
            <p className="text-xl font-bold">$3.00<span className="text-sm font-normal">/mo</span></p>
          </div>
        </div>
        
        <div className={`flex flex-col p-4 border rounded-lg cursor-pointer ${planType === "yearly" ? "border-primary" : ""}`}
             onClick={() => onPlanTypeChange("yearly")}>
          <RadioGroupItem value="yearly" id="yearly" className="sr-only" />
          <Label htmlFor="yearly" className="flex justify-between items-start cursor-pointer">
            <div>
              <h3 className="font-medium">Yearly</h3>
              <p className="text-sm text-muted-foreground">Save 16% annually</p>
            </div>
            {planType === "yearly" && <Check className="h-5 w-5 text-primary" />}
          </Label>
          <div className="mt-auto pt-4">
            <p className="text-xl font-bold">$30.00<span className="text-sm font-normal">/yr</span></p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
