
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"
import { Button } from "@/components/ui/button"

interface GroupedTaskListsProps {
  groupedTasks: Record<string, Task[]>
  groupBy: string | null
  isLoadingTasks: boolean
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onAddTask: () => void
  hideTitle?: boolean
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void
  onTaskEdit?: (task: Task) => void
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void
  onDateChange?: (taskId: string, date: Date | undefined) => void
  onProjectChange?: (taskId: string, projectId: string | null) => void
}

export function GroupedTaskLists({
  groupedTasks,
  groupBy,
  isLoadingTasks,
  onComplete,
  onDelete,
  onAddTask,
  hideTitle = false,
  onFavoriteToggle,
  onTaskEdit,
  onPriorityChange,
  onDateChange,
  onProjectChange
}: GroupedTaskListsProps) {
  // Function to get priority group title
  const getPriorityGroupTitle = (group: string): string => {
    if (groupBy === "priority") {
      switch (group) {
        case "1": return "Priority 1 (Highest)";
        case "2": return "Priority 2 (High)";
        case "3": return "Priority 3 (Medium)";
        case "4": return "Priority 4 (Low)";
        default: return group;
      }
    }
    return groupBy ? group : "Project Tasks";
  };

  if (Object.keys(groupedTasks).length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <h3 className="text-base md:text-lg font-medium mb-2">No tasks in this project</h3>
        <p className="text-muted-foreground text-sm mb-4">Add a task to get started!</p>
        <Button onClick={onAddTask} size="sm">Add a Task</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedTasks).map(([group, groupTasks]) => (
        <TaskList
          key={group}
          title={hideTitle ? "" : getPriorityGroupTitle(group)}
          tasks={groupTasks}
          isLoading={isLoadingTasks}
          emptyMessage="No tasks in this group"
          onComplete={onComplete}
          onDelete={onDelete}
          onFavoriteToggle={onFavoriteToggle}
          onTaskEdit={onTaskEdit}
          onPriorityChange={onPriorityChange}
          onDateChange={onDateChange}
          onProjectChange={onProjectChange}
        />
      ))}
    </div>
  )
}
