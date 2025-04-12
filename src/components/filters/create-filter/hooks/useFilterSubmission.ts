
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface Condition {
  id: string;
  type: string;
  value: string;
  operator?: string;
}

// Hook for handling filter submission
export function useFilterSubmission(
  user: User | null,
  name: string,
  conditions: Condition[],
  logic: string,
  onOpenChange: (open: boolean) => void,
  validateFilterName: (name: string) => boolean,
  conditionType: string,
  conditionValue: string,
  conditionOperator: string
) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!validateFilterName(name)) {
      return;
    }

    // Add the current condition if there's a value but user didn't click "Add Condition"
    if (conditionValue && conditions.length === 0) {
      const newCondition: Condition = {
        id: Date.now().toString(),
        type: conditionType,
        value: conditionValue,
        operator: conditionOperator
      };
      
      // Process submission with the new condition
      submitFilter([newCondition]);
      return;
    }

    if (conditions.length === 0) {
      toast.error("At least one condition is required");
      return;
    }

    submitFilter(conditions);
  };

  const submitFilter = async (conditionsToSubmit: Condition[]) => {
    if (!user) {
      toast.error("You must be logged in to create a filter");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('filters')
        .insert({
          name: name.trim(),
          conditions: {
            logic,
            items: conditionsToSubmit.map(c => ({
              type: c.type,
              value: c.value,
              operator: c.operator
            }))
          },
          user_id: user.id
        });

      if (error) throw error;

      toast.success("Filter created successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Error creating filter: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
}
