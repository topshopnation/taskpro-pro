
import { useState } from "react";
import { Star, MoreHorizontal, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomFilter } from "@/types/filterTypes";
import { isStandardFilter } from "@/utils/filterUtils";

interface FilterHeaderProps {
  filter: CustomFilter;
  onFavoriteToggle: () => void;
  onRenameClick: () => void;
  onDeleteClick: () => void;
}

export function FilterHeader({
  filter,
  onFavoriteToggle,
  onRenameClick,
  onDeleteClick,
}: FilterHeaderProps) {
  const isStandard = isStandardFilter(filter.id);
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-bold tracking-tight">{filter.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onFavoriteToggle}
          disabled={isStandard}
        >
          <Star 
            className={
              filter.favorite
                ? "h-5 w-5 fill-yellow-400 text-yellow-400"
                : "h-5 w-5 text-muted-foreground"
            } 
          />
          <span className="sr-only">
            {filter.favorite ? "Remove from favorites" : "Add to favorites"}
          </span>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        {!isStandard && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRenameClick}>
                <Edit className="mr-2 h-4 w-4" />
                Rename Filter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
