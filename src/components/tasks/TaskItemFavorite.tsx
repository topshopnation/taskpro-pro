
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface TaskItemFavoriteProps {
  favorite: boolean
  onToggle: () => void
  isUpdating: boolean
}

export function TaskItemFavorite({ favorite, onToggle, isUpdating }: TaskItemFavoriteProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={onToggle}
          disabled={isUpdating}
        >
          <Star 
            className={cn(
              "h-4 w-4", 
              favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            )} 
          />
          <span className="sr-only">
            {favorite ? "Remove from favorites" : "Add to favorites"}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {favorite ? "Remove from favorites" : "Add to favorites"}
      </TooltipContent>
    </Tooltip>
  )
}
