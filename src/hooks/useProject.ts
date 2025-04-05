
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export function useProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const { user } = useAuth()

  // Fetch project data
  const fetchProject = async () => {
    if (!user || !id) return null
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
        
      if (error) throw error
      
      return {
        id: data.id,
        name: data.name,
        favorite: data.favorite || false
      }
    } catch (error: any) {
      toast.error("Failed to fetch project", {
        description: error.message
      })
      navigate('/')
      return null
    }
  }
  
  // Use React Query to fetch project
  const { data: currentProject, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', id, user?.id],
    queryFn: fetchProject,
    enabled: !!user && !!id
  })

  const handleProjectFavoriteToggle = async () => {
    if (!currentProject) return
    
    try {
      const newValue = !currentProject.favorite
      
      const { error } = await supabase
        .from('projects')
        .update({ favorite: newValue })
        .eq('id', id)
        
      if (error) throw error
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites")
    } catch (error: any) {
      toast.error("Failed to update project", {
        description: error.message
      })
    }
  }

  const handleProjectRename = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required")
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: newProjectName })
        .eq('id', id)
        
      if (error) throw error
      
      setIsEditProjectOpen(false)
      toast.success("Project renamed successfully")
    } catch (error: any) {
      toast.error("Failed to rename project", {
        description: error.message
      })
    }
  }

  const handleProjectDelete = async () => {
    try {
      // Delete all tasks in this project first
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', id)
        
      if (tasksError) throw tasksError
      
      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      
      setIsDeleteProjectOpen(false)
      toast.success("Project deleted successfully")
      navigate('/') // Navigate to dashboard after deletion
    } catch (error: any) {
      toast.error("Failed to delete project", {
        description: error.message
      })
    }
  }

  return {
    id,
    currentProject,
    isLoadingProject,
    isEditProjectOpen,
    setIsEditProjectOpen,
    isDeleteProjectOpen,
    setIsDeleteProjectOpen,
    newProjectName,
    setNewProjectName,
    handleProjectFavoriteToggle,
    handleProjectRename,
    handleProjectDelete
  }
}
