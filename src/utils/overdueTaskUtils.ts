
import { Task } from "@/components/tasks/TaskItem"
import { format, startOfDay, endOfDay } from "date-fns"

export function sortTasks(tasks: Task[], sortBy: string, sortDirection: "asc" | "desc"): Task[] {
  return [...tasks].sort((a, b) => {
    if (sortBy === "title") {
      return sortDirection === "asc" 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    } else if (sortBy === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return sortDirection === "asc" ? 1 : -1
      if (!b.dueDate) return sortDirection === "asc" ? -1 : 1
      
      return sortDirection === "asc" 
        ? a.dueDate.getTime() - b.dueDate.getTime()
        : b.dueDate.getTime() - a.dueDate.getTime()
    } else if (sortBy === "priority") {
      // For priority, lower number means higher priority (1 is highest)
      return sortDirection === "asc" 
        ? a.priority - b.priority  // High to low (1 first)
        : b.priority - a.priority  // Low to high (4 first)
    } else if (sortBy === "project") {
      const projectNameA = a.projectName || "No Project"
      const projectNameB = b.projectName || "No Project"
      return sortDirection === "asc" 
        ? projectNameA.localeCompare(projectNameB)
        : projectNameB.localeCompare(projectNameA)
    }
    return 0
  })
}

export function groupTasks(tasks: Task[], groupBy: string | null, sortBy: string, sortDirection: "asc" | "desc"): Record<string, Task[]> {
  if (!groupBy) return { "All Tasks": sortTasks(tasks, sortBy, sortDirection) }
  
  const grouped: Record<string, Task[]> = {}
  
  tasks.forEach(task => {
    let groupKey = ""
    
    if (groupBy === "project") {
      groupKey = task.projectName || "No Project"
    } else if (groupBy === "dueDate") {
      groupKey = task.dueDate 
        ? format(task.dueDate, 'PPP') 
        : "No Due Date"
    } else if (groupBy === "title") {
      groupKey = task.title.charAt(0).toUpperCase()
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
  
  Object.keys(grouped).forEach(key => {
    grouped[key] = sortTasks(grouped[key], sortBy, sortDirection)
  })
  
  return grouped
}

export function getTodayDate(): string {
  const today = new Date()
  return format(today, 'yyyy-MM-dd')
}

// Updated function to get the start of today for comparison
export function getStartOfToday(): Date {
  return startOfDay(new Date())
}

// Function to get the end of yesterday
export function getEndOfYesterday(): Date {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return endOfDay(yesterday);
}
