
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { Tag } from "../taskTypes"

export function useTaskData(taskId: string, projectId: string) {
  const [taskTags, setTaskTags] = useState<Tag[]>([])
  const [projectName, setProjectName] = useState<string>("")
  const { user } = useAuth()

  // Fetch task tags
  useEffect(() => {
    const fetchTaskTags = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await (supabase as any)
          .from('task_tags')
          .select('tags(id, name, color)')
          .eq('task_id', taskId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const tags = data.map((item: any) => item.tags as Tag);
        setTaskTags(tags);
      } catch (error: any) {
        console.error("Failed to fetch task tags:", error.message);
      }
    };
    
    fetchTaskTags();
  }, [taskId, user]);

  // Fetch project name
  useEffect(() => {
    const fetchProjectName = async () => {
      if (!projectId || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('name')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProjectName(data.name);
        }
      } catch (error: any) {
        console.error("Failed to fetch project name:", error.message);
      }
    };
    
    fetchProjectName();
  }, [projectId, user]);

  return { taskTags, projectName };
}
