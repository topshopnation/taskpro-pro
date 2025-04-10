
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ProjectHeaderProps {
  name: string;
  favorite: boolean;
  color?: string;
  onFavoriteToggle: () => void;
  onRenameClick: () => void;
  onDeleteClick: () => void;
  onColorChange: (color: string) => void;
}

export function ProjectHeader({
  name,
  favorite,
  color,
  onFavoriteToggle,
  onRenameClick,
  onDeleteClick,
}: ProjectHeaderProps) {
  return (
    <div className="mb-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 
            className="text-2xl font-bold"
            style={color ? { color } : undefined}
          >
            {name}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex items-center justify-center"
            onClick={onFavoriteToggle}
          >
            <Star
              className={`h-4 w-4 ${
                favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
            <span className="sr-only">
              {favorite ? "Remove from favorites" : "Add to favorites"}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 flex items-center justify-center" 
            onClick={onRenameClick}
            type="button"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onDeleteClick}
            className="text-destructive h-8 w-8 flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
