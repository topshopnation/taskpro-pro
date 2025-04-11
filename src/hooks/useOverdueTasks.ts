
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Task } from "@/components/tasks/TaskItem"
import { getStartOfToday } from "@/utils/overdueTaskUtils"

export function useOverdueTasks(userId: string | undefined) {
  const fetchOverdueTasks = async () => {
    if (!userId) return []
    
    const startOfToday = getStartOfToday()
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .lt('due_date', startOfToday.toISOString())
        .not('due_date', 'is', null)
        
      if (error) throw error
      
      return data.map((task: any) => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority || 4,
        projectId: task.project_id,
        section: task.section,
        completed: task.completed || false,
        favorite: task.favorite || false
      }))
    } catch (error: any) {
      toast.error("Failed to fetch overdue tasks", {
        description: error.message
      })
      return []
    }
  }
  
  return useQuery({
    queryKey: ['overdue-tasks', userId],
    queryFn: fetchOverdueTasks,
    enabled: !!userId
  })
}
