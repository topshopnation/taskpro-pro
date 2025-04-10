
import { Task } from "@/components/tasks/TaskItem"
import { format } from "date-fns"

export type SortDirection = "asc" | "desc"

export const sortTasks = (tasksToSort: Task[], sortBy: string, sortDirection: SortDirection) => {
  return [...tasksToSort].sort((a, b) => {
    if (sortBy === "title") {
      return sortDirection === "asc" 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    } else if (sortBy === "dueDate") {
      // Handle null or undefined dates
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return sortDirection === "asc" ? 1 : -1
      if (!b.dueDate) return sortDirection === "asc" ? -1 : 1
      
      return sortDirection === "asc" 
        ? a.dueDate.getTime() - b.dueDate.getTime()
        : b.dueDate.getTime() - a.dueDate.getTime()
    }
    return 0
  })
}

export const groupTasks = (tasksToGroup: Task[], groupBy: string | null, sortBy: string, sortDirection: SortDirection) => {
  if (!groupBy) return { "All Tasks": sortTasks(tasksToGroup, sortBy, sortDirection) }
  
  const grouped: Record<string, Task[]> = {}
  
  tasksToGroup.forEach(task => {
    let groupKey = ""
    
    if (groupBy === "title") {
      // Group by first letter of title
      groupKey = task.title.charAt(0).toUpperCase()
    } else if (groupBy === "dueDate") {
      groupKey = task.dueDate 
        ? format(task.dueDate, 'PPP') 
        : "No Due Date"
    }
    
    if (!grouped[groupKey]) {
      grouped[groupKey] = []
    }
    grouped[groupKey].push(task)
  })
  
  // Sort each group
  Object.keys(grouped).forEach(key => {
    grouped[key] = sortTasks(grouped[key], sortBy, sortDirection)
  })
  
  return grouped
}
