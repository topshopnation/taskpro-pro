
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PriceInputsProps {
  monthlyPrice: number;
  yearlyPrice: number;
  onMonthlyPriceChange: (price: number) => void;
  onYearlyPriceChange: (price: number) => void;
}

export function PriceInputs({ 
  monthlyPrice, 
  yearlyPrice, 
  onMonthlyPriceChange, 
  onYearlyPriceChange 
}: PriceInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="price_monthly">Monthly Price ($)</Label>
        <Input 
          id="price_monthly" 
          type="number" 
          min="0" 
          step="0.01"
          value={monthlyPrice || 0} 
          onChange={(e) => onMonthlyPriceChange(parseFloat(e.target.value))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price_yearly">Yearly Price ($)</Label>
        <Input 
          id="price_yearly" 
          type="number" 
          min="0" 
          step="0.01"
          value={yearlyPrice || 0} 
          onChange={(e) => onYearlyPriceChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
