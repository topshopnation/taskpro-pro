
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { ProjectOption } from "@/components/tasks/taskTypes"

export function useTaskProjects() {
  const { user } = useAuth()

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, color')
        .eq('user_id', user.id)
        .order('name')
      
      if (error) {
        console.error('Error fetching projects:', error)
        throw error
      }
      
      // Ensure we have properly formatted project options with names
      const projectOptions = (data || []).map(project => ({
        id: project.id,
        name: project.name || 'Unnamed Project',
        color: project.color
      }))
      
      return projectOptions
    },
    enabled: !!user,
  })

  return {
    projects: projects as ProjectOption[],
    isLoading
  }
}
