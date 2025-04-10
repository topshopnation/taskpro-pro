
import { Button } from "@/components/ui/button"

interface EmptyTodayStateProps {
  onAddTask: () => void
}

export function EmptyTodayState({ onAddTask }: EmptyTodayStateProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-8 text-center">
      <h3 className="text-lg font-medium mb-2">No tasks due today</h3>
      <p className="text-muted-foreground mb-4">Your schedule is clear for today.</p>
      <Button onClick={onAddTask}>Add a Task</Button>
    </div>
  )
}
