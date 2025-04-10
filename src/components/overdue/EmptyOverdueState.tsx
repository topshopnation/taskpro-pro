
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface EmptyOverdueStateProps {
  onAddTaskClick: () => void
}

export function EmptyOverdueState({ onAddTaskClick }: EmptyOverdueStateProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-8 text-center">
      <h3 className="text-lg font-medium mb-2">No overdue tasks</h3>
      <p className="text-muted-foreground mb-4">You're all caught up!</p>
      <Button onClick={onAddTaskClick} className="flex items-center space-x-1.5">
        <Plus className="h-4 w-4" />
        <span>Add a Task</span>
      </Button>
    </div>
  )
}
