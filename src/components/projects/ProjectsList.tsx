import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Edit, Trash2, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  favorite: boolean;
  color?: string;
  user_id: string;
}

interface ProjectsListProps {
  projects: Project[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const navigate = useNavigate();
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [projectColor, setProjectColor] = useState("");
  
  const projectColors = [
    "#FF6B6B", "#FF9E7D", "#FFCA80", "#FFEC8A", "#BADA55", 
    "#7ED957", "#4ECDC4", "#45B7D1", "#4F86C6", "#5E60CE", 
    "#7950F2", "#9775FA", "#C77DFF", "#E77FF3", "#F26ABC", 
    "#F868B3", "#FF66A3", "#A1A09E", "#6D6A75", "#6C757D"
  ];

  const handleProjectClick = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log("ProjectsList - Navigating to project:", projectId);
    navigate(`/projects/${projectId}`);
  };

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setNewProjectName(project.name);
    setProjectColor(project.color || "");
    setIsEditProjectOpen(true);
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setIsDeleteProjectOpen(true);
  };

  const handleFavoriteToggle = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newValue = !project.favorite;
      
      const { error } = await supabase
        .from('projects')
        .update({ favorite: newValue })
        .eq('id', project.id);
        
      if (error) throw error;
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites");
    } catch (error: any) {
      toast.error("Failed to update project", {
        description: error.message
      });
    }
  };

  const handleProjectRename = async () => {
    if (!selectedProject) return;
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const updateData: {
        name: string;
        color?: string;
      } = {
        name: newProjectName
      };
      
      if (projectColor) {
        updateData.color = projectColor;
      }
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', selectedProject.id);
        
      if (error) throw error;
      
      setIsEditProjectOpen(false);
      toast.success("Project updated successfully");
    } catch (error: any) {
      toast.error("Failed to update project", {
        description: error.message
      });
    }
  };

  const handleProjectDelete = async () => {
    if (!selectedProject) return;
    
    try {
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', selectedProject.id);
        
      if (tasksError) throw tasksError;
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id);
        
      if (error) throw error;
      
      setIsDeleteProjectOpen(false);
      toast.success("Project deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete project", {
        description: error.message
      });
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={(e) => handleProjectClick(project.id, e)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle 
                  className="text-lg flex items-center gap-2"
                  style={{ color: project.color || undefined }}
                >
                  <ListTodo className="h-5 w-5" style={{ color: project.color || undefined }} />
                  {project.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => handleFavoriteToggle(project, e)}
              >
                <Star
                  className={`h-5 w-5 ${
                    project.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
                <span className="sr-only">
                  {project.favorite ? "Remove from favorites" : "Add to favorites"}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => handleEditClick(project, e)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => handleDeleteClick(project, e)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                autoFocus
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Project Color</p>
              <IconPicker 
                colors={projectColors} 
                onChange={setProjectColor} 
                selectedColor={projectColor || ""} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProjectRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all of its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleProjectDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
