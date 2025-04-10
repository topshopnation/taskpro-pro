
import { Pencil, Star, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconPicker } from "@/components/ui/color-picker";

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
  onColorChange,
}: ProjectHeaderProps) {
  const projectColors = [
    "#FF6B6B", "#FF9E7D", "#FFCA80", "#FFEC8A", "#BADA55", 
    "#7ED957", "#4ECDC4", "#45B7D1", "#4F86C6", "#5E60CE", 
    "#7950F2", "#9775FA", "#C77DFF", "#E77FF3", "#F26ABC", 
    "#F868B3", "#FF66A3", "#A1A09E", "#6D6A75", "#6C757D"
  ];

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
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
                className="h-8 w-8 flex items-center justify-center"
                style={color ? { color } : undefined}
              >
                <Palette className="h-4 w-4" />
                <span className="sr-only">Change color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Project Color</h4>
                <IconPicker 
                  colors={projectColors} 
                  onChange={onColorChange}
                  selectedColor={color}
                />
              </div>
            </PopoverContent>
          </Popover>
          
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
