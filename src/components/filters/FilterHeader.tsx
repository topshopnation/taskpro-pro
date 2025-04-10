
import { Pencil, Star, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomFilter } from "@/types/filterTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconPicker } from "@/components/ui/color-picker";

interface FilterHeaderProps {
  filter: CustomFilter;
  onFavoriteToggle: () => void;
  onRenameClick: () => void;
  onDeleteClick: () => void;
  onColorChange: (color: string) => void;
}

export function FilterHeader({
  filter,
  onFavoriteToggle,
  onRenameClick,
  onDeleteClick,
  onColorChange,
}: FilterHeaderProps) {
  const filterColors = [
    "#FF6B6B", "#FF9E7D", "#FFCA80", "#FFEC8A", "#BADA55", 
    "#7ED957", "#4ECDC4", "#45B7D1", "#4F86C6", "#5E60CE", 
    "#7950F2", "#9775FA", "#C77DFF", "#E77FF3", "#F26ABC", 
    "#F868B3", "#FF66A3", "#A1A09E", "#6D6A75", "#6C757D"
  ];

  return (
    <div className="mb-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{filter.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex items-center justify-center"
            onClick={onFavoriteToggle}
            type="button"
          >
            <Star
              className={`h-5 w-5 ${
                filter.favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
            <span className="sr-only">
              {filter.favorite ? "Remove from favorites" : "Add to favorites"}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 flex items-center justify-center"
                type="button"
              >
                <Palette className="h-5 w-5" style={filter.color ? { color: filter.color } : undefined} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <IconPicker 
                  colors={filterColors} 
                  onChange={onColorChange} 
                  selectedColor={filter.color || ""} 
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 flex items-center justify-center" 
            onClick={onRenameClick}
            type="button"
          >
            <Pencil className="h-5 w-5" />
            <span className="sr-only">Rename</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={onDeleteClick}
            className="text-destructive h-9 w-9 flex items-center justify-center"
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
      <Separator className="mt-4" />
    </div>
  );
}
