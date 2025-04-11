
import { useState } from "react";
import { Task } from "@/components/tasks/TaskItem";
import { TaskList } from "@/components/tasks/TaskList";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { RescheduleDialog } from "@/components/overdue/RescheduleDialog";
import { EmptyOverdueState } from "@/components/overdue/EmptyOverdueState";
import { OverdueSortControls } from "@/components/overdue/OverdueSortControls";
import { groupTasks } from "@/utils/overdueTaskUtils";

interface OverdueContentProps {
  tasks: Task[];
  isLoading: boolean;
  onComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onFavoriteToggle: (taskId: string, favorite: boolean) => void;
  onReschedule: () => void;
}

export function OverdueContent({
  tasks,
  isLoading,
  onComplete,
  onDelete,
  onFavoriteToggle,
  onReschedule
}: OverdueContentProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
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

  const groupedTasks = groupTasks(tasks, groupBy, sortBy, sortDirection);

  return (
    <div className="space-y-6">
      <OverdueSortControls
        sortBy={sortBy}
        sortDirection={sortDirection}
        groupBy={groupBy}
        onSortChange={handleSortChange}
        onGroupChange={handleGroupChange}
      />

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
            />
          ))
        )}
      </div>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
      />

      <RescheduleDialog
        open={isRescheduleOpen}
        onOpenChange={setIsRescheduleOpen}
        tasks={tasks}
        onSuccess={onReschedule}
      />

      {/* Button to open reschedule dialog */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          onClick={() => setIsRescheduleOpen(true)}
          className="bg-primary text-white p-3 rounded-full shadow-lg"
          disabled={tasks.length === 0}
        >
          Reschedule All
        </button>
      </div>
    </div>
  );
}
