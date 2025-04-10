
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const [isNameError, setIsNameError] = useState(false)
  
  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setName("")
      setIsNameError(false)
    }
  }, [open])

  // Fetch existing project names to check for duplicates
  const { data: existingProjects } = useQuery({
    queryKey: ['project-names', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('projects')
        .select('name')
        .eq('user_id', user.id)
        
      if (error) {
        console.error("Error fetching project names:", error)
        return []
      }
      
      return data || []
    },
    enabled: !!user && open
  })

  const validateProjectName = (projectName: string) => {
    const trimmedName = projectName.trim()
    if (!trimmedName) {
      setIsNameError(true)
      return false
    }
    
    const isDuplicate = existingProjects?.some(
      project => project.name.toLowerCase() === trimmedName.toLowerCase()
    )
    
    if (isDuplicate) {
      setIsNameError(true)
      toast.error("A project with this name already exists")
      return false
    }
    
    setIsNameError(false)
    return true
  }

  const handleSubmit = async () => {
    if (!validateProjectName(name)) {
      return
    }

    if (!user) {
      toast.error("You must be logged in to create a project")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          name: name.trim(),
          favorite: false,
          user_id: user.id
        })

      if (error) throw error

      toast.success("Project created successfully")
      setName("")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(`Error creating project: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (isNameError) validateProjectName(e.target.value)
              }}
              placeholder="Enter project name"
              autoFocus
              className={isNameError ? "border-destructive" : ""}
            />
            {isNameError && (
              <p className="text-sm text-destructive">
                Please enter a unique project name
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
