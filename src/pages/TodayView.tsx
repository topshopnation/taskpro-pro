
import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useTodayViewTasks } from "@/hooks/useTodayViewTasks"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { TodaySortControls } from "@/components/today/TodaySortControls"
import { TodayViewHeader } from "@/components/today/TodayViewHeader"
import { EmptyTodayState } from "@/components/today/EmptyTodayState"
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists"
import { groupTasks } from "@/utils/todayViewUtils"

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <TodayViewHeader />
          
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

        <div className="space-y-6">
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
