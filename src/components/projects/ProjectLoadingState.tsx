
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface ProjectLoadingStateProps {
  isLoading: boolean
  projectExists: boolean
}

export function ProjectLoadingState({ isLoading, projectExists }: ProjectLoadingStateProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!projectExists) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
      </div>
    )
  }

  return null
}
