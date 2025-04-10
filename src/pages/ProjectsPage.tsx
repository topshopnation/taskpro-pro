
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, ListTodo, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { ProjectsList } from "@/components/projects/ProjectsList";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;

        setProjects(data || []);
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();

    // Set up real-time listener
    const subscription = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          </div>
          <Button onClick={() => setIsCreateProjectOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">Create your first project to get started</p>
            <Button onClick={() => setIsCreateProjectOpen(true)}>
              Create Project
            </Button>
          </div>
        ) : (
          <ProjectsList projects={projects} />
        )}

        <CreateProjectDialog 
          open={isCreateProjectOpen}
          onOpenChange={setIsCreateProjectOpen}
        />
      </div>
    </AppLayout>
  );
}
