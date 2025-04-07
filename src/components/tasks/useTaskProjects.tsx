
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
        .select('id, name')
        .eq('user_id', user.id)
      
      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  return {
    projects: projects as ProjectOption[],
    isLoading
  }
}
