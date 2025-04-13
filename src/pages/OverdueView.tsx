
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OverdueHeader } from "@/components/overdue/OverdueHeader";
import { OverdueContent } from "@/components/overdue/OverdueContent";
import { useOverdueTasks } from "@/hooks/useOverdueTasks";
import { useOverdueTaskOperations } from "@/hooks/useOverdueTaskOperations";
import { RescheduleDialog } from "@/components/overdue/RescheduleDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function OverdueView() {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const { user } = useAuth();
  const { data: tasks, isLoading, refetch } = useOverdueTasks(user?.id);
  const { handleComplete, handleDelete, handleFavoriteToggle } = useOverdueTaskOperations();

  const handleRescheduleClick = () => {
    setIsRescheduleOpen(true);
  };

  const handleProjectChange = async (taskId: string, projectId: string | null) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ project_id: projectId })
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success(projectId ? "Task moved to project" : "Task moved to inbox");
      await refetch();
      return Promise.resolve();
    } catch (error: any) {
      toast.error(`Error changing project: ${error.message}`);
      return Promise.reject(error);
    }
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
            onProjectChange={handleProjectChange}
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
