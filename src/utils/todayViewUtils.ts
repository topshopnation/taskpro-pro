
import { Task } from "@/components/tasks/TaskItem"
import { format } from "date-fns"

// Sort tasks by various criteria
export function sortTasks(
  tasks: Task[], 
  sortBy: string, 
  sortDirection: "asc" | "desc"
): Task[] {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
          
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return sortDirection === "asc" ? 1 : -1
        if (!b.dueDate) return sortDirection === "asc" ? -1 : 1
        
        return sortDirection === "asc"
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime()
          
      case "project":
        const nameA = a.projectName || "No Project"
        const nameB = b.projectName || "No Project"
        return sortDirection === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA)
          
      default:
        return 0
    }
  })
}

// Group tasks by various criteria
export function groupTasks(
  tasks: Task[],
  groupBy: string | null,
  sortBy: string,
  sortDirection: "asc" | "desc"
): Record<string, Task[]> {
  if (!groupBy) {
    return { "All Tasks": sortTasks(tasks, sortBy, sortDirection) }
  }
  
  const grouped: Record<string, Task[]> = {}
  
  tasks.forEach(task => {
    let groupKey = ""
    
    switch (groupBy) {
      case "project":
        groupKey = task.projectName || "No Project"
        break
        
      case "dueDate":
        groupKey = task.dueDate
          ? format(task.dueDate, 'PPP')
          : "No Due Date"
        break
        
      case "title":
        groupKey = task.title.charAt(0).toUpperCase()
        break
        
      default:
        groupKey = "All Tasks"
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
