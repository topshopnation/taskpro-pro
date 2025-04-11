
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export function useProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [projectColor, setProjectColor] = useState("")
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
        favorite: data.favorite || false,
        color: data.color || null
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
    if (!currentProject || !id) return
    
    try {
      const newValue = !currentProject.favorite
      
      const { error } = await supabase
        .from('projects')
        .update({ favorite: newValue })
        .eq('id', id)
        
      if (error) throw error
      
      // Update the local state and invalidate queries to refresh the sidebar favorites
      queryClient.invalidateQueries({ queryKey: ['project', id, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['favorite-projects'] })
      
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
      const updateData: {
        name: string;
        color?: string;
      } = {
        name: newProjectName
      }
      
      if (projectColor) {
        updateData.color = projectColor
      }
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        
      if (error) throw error
      
      setIsEditProjectOpen(false)
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['project', id, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['favorite-projects'] })
      
      toast.success("Project updated successfully")
    } catch (error: any) {
      toast.error("Failed to update project", {
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
      navigate('/today') // Navigate to Today page after deletion instead of home
    } catch (error: any) {
      toast.error("Failed to delete project", {
        description: error.message
      })
    }
  }

  const handleProjectColorChange = async (color: string) => {
    if (!currentProject) return
    
    setProjectColor(color)
    
    if (!isEditProjectOpen) {
      try {
        const { error } = await supabase
          .from('projects')
          .update({ color })
          .eq('id', id)
          
        if (error) throw error
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['project', id, user?.id] })
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        queryClient.invalidateQueries({ queryKey: ['favorite-projects'] })
        
        toast.success("Project color updated")
      } catch (error: any) {
        toast.error("Failed to update project color", {
          description: error.message
        })
      }
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
    projectColor,
    setProjectColor,
    handleProjectFavoriteToggle,
    handleProjectRename,
    handleProjectDelete,
    handleProjectColorChange
  }
}
