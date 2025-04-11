
import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useTodayViewTasks } from "@/hooks/useTodayViewTasks"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { TodaySortControls } from "@/components/today/TodaySortControls"
import { TodayViewHeader } from "@/components/today/TodayViewHeader"
import { EmptyTodayState } from "@/components/today/EmptyTodayState"
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists"
import { groupTasks } from "@/utils/todayViewUtils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function TodayView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  
  const { 
    tasks, 
    isLoading, 
    handleComplete, 
    handleDelete, 
    handleFavoriteToggle 
  } = useTodayViewTasks()

  // Group tasks based on current settings
  const groupedTasks = groupTasks(tasks, groupBy, sortBy, sortDirection)

  return (
    <AppLayout>
      <div className="space-y-4 max-w-screen-xl mx-auto px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <TodayViewHeader />
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => setIsCreateTaskOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
            
            <TodaySortControls
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              onAddTask={() => setIsCreateTaskOpen(true)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {Object.keys(groupedTasks).length === 0 ? (
            <EmptyTodayState onAddTask={() => setIsCreateTaskOpen(true)} />
          ) : (
            <GroupedTaskLists
              groupedTasks={groupedTasks}
              groupBy={groupBy}
              isLoadingTasks={isLoading}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onAddTask={() => setIsCreateTaskOpen(true)}
              onFavoriteToggle={handleFavoriteToggle}
              hideTitle={!groupBy}
            />
          )}
        </div>

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />
      </div>
    </AppLayout>
  )
}
