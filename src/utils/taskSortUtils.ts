
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
    } else if (sortBy === "project") {
      const projectNameA = a.projectName || "No Project"
      const projectNameB = b.projectName || "No Project"
      return sortDirection === "asc" 
        ? projectNameA.localeCompare(projectNameB)
        : projectNameB.localeCompare(projectNameA)
    } else if (sortBy === "priority") {
      // For priority, lower number means higher priority (1 is highest)
      return sortDirection === "asc" 
        ? a.priority - b.priority  // High to low (1 first)
        : b.priority - a.priority  // Low to high (4 first)
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
    } else if (groupBy === "project") {
      groupKey = task.projectName || "No Project"
    } else if (groupBy === "priority") {
      const priorityLabels: Record<number, string> = {
        1: "Priority 1 (Highest)",
        2: "Priority 2",
        3: "Priority 3",
        4: "Priority 4 (Lowest)"
      }
      groupKey = priorityLabels[task.priority] || "No Priority"
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
