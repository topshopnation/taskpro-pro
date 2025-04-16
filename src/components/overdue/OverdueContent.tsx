
import { useState } from "react";
import { Task } from "@/components/tasks/TaskItem";
import { TaskList } from "@/components/tasks/TaskList";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { EmptyOverdueState } from "@/components/overdue/EmptyOverdueState";
import { OverdueSortControls } from "@/components/overdue/OverdueSortControls";
import { groupTasks, sortTasks } from "@/utils/overdueTaskUtils";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { SubscriptionRestriction } from "@/components/subscription/SubscriptionRestriction";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";

interface OverdueContentProps {
  tasks: Task[];
  isLoading: boolean;
  onComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onFavoriteToggle: (taskId: string, favorite: boolean) => void;
  onReschedule: () => void;
  isRescheduleOpen?: boolean;
  setIsRescheduleOpen?: (open: boolean) => void;
  onProjectChange?: (taskId: string, projectId: string | null) => Promise<void>;
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
}

export function OverdueContent({
  tasks,
  isLoading,
  onComplete,
  onDelete,
  onFavoriteToggle,
  onReschedule,
  isRescheduleOpen,
  setIsRescheduleOpen,
  onProjectChange,
  onPriorityChange,
  onDateChange
}: OverdueContentProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [groupBy, setGroupBy] = useState<string | null>(null);

  const handleSortChange = (newSortBy: string, newDirection: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const handleGroupChange = (newGroupBy: string | null) => {
    setGroupBy(newGroupBy);
  };

  const handleRescheduleClick = () => {
    if (setIsRescheduleOpen) {
      setIsRescheduleOpen(true);
    }
  };

  const groupedTasks = groupTasks(tasks, groupBy, sortBy, sortDirection);

  return (
    <div className="space-y-6">
      <SubscriptionBanner />
      
      <SubscriptionRestriction>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-grow"></div>
          <div className="flex items-center gap-2">
            {tasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRescheduleClick}
                className="flex items-center gap-1"
              >
                <CalendarClock className="h-4 w-4" />
                <span>Reschedule All</span>
              </Button>
            )}
            <OverdueSortControls
              sortBy={sortBy}
              sortDirection={sortDirection}
              groupBy={groupBy}
              onSortChange={handleSortChange}
              onGroupChange={handleGroupChange}
            />
          </div>
        </div>

        <div className="space-y-6">
          {Object.keys(groupedTasks).length === 0 ? (
            <EmptyOverdueState onAddTaskClick={() => setIsCreateTaskOpen(true)} />
          ) : (
            Object.entries(groupedTasks).map(([group, groupTasks]) => (
              <TaskList
                key={group}
                title={groupBy ? group : ""}
                tasks={groupTasks}
                isLoading={isLoading}
                emptyMessage="No tasks in this group"
                onComplete={onComplete}
                onDelete={onDelete}
                onFavoriteToggle={onFavoriteToggle}
                onProjectChange={onProjectChange}
                onPriorityChange={onPriorityChange}
                onDateChange={onDateChange}
              />
            ))
          )}
        </div>
      </SubscriptionRestriction>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />

      {/* Fixed floating button for mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        {tasks.length > 0 && (
          <Button
            onClick={handleRescheduleClick}
            className="bg-primary text-white p-3 rounded-full shadow-lg"
          >
            <CalendarClock className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
