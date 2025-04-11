
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OverdueHeader } from "@/components/overdue/OverdueHeader";
import { OverdueContent } from "@/components/overdue/OverdueContent";
import { useOverdueTasks } from "@/hooks/useOverdueTasks";
import { useOverdueTaskOperations } from "@/hooks/useOverdueTaskOperations";
import { RescheduleDialog } from "@/components/overdue/RescheduleDialog";

export default function OverdueView() {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const { user } = useAuth();
  const { data: tasks, isLoading, refetch } = useOverdueTasks(user?.id);
  const { handleComplete, handleDelete, handleFavoriteToggle } = useOverdueTaskOperations();

  const handleRescheduleClick = () => {
    setIsRescheduleOpen(true);
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <OverdueHeader 
            onRescheduleClick={handleRescheduleClick} 
            taskCount={tasks?.length || 0}
          />

          <OverdueContent
            tasks={tasks || []}
            isLoading={isLoading}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onFavoriteToggle={handleFavoriteToggle}
            onReschedule={refetch}
            isRescheduleOpen={isRescheduleOpen}
            setIsRescheduleOpen={setIsRescheduleOpen}
          />
        </div>
      </TooltipProvider>
      
      {/* Add RescheduleDialog at the page level */}
      <RescheduleDialog
        open={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        tasks={tasks || []}
        onSuccess={refetch}
      />
    </AppLayout>
  );
}
