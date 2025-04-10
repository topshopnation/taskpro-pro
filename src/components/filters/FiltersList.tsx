
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Edit, Trash2, Filter } from "lucide-react";
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
import { isStandardFilter } from "@/utils/filterUtils";

interface FilterItem {
  id: string;
  name: string;
  favorite: boolean;
  color?: string;
  user_id: string;
  conditions: any;
}

interface FiltersListProps {
  filters: FilterItem[];
}

export function FiltersList({ filters }: FiltersListProps) {
  const navigate = useNavigate();
  const [isEditFilterOpen, setIsEditFilterOpen] = useState(false);
  const [isDeleteFilterOpen, setIsDeleteFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterItem | null>(null);
  const [newFilterName, setNewFilterName] = useState("");
  const [filterColor, setFilterColor] = useState("");
  
  const filterColors = [
    "#FF6B6B", "#FF9E7D", "#FFCA80", "#FFEC8A", "#BADA55", 
    "#7ED957", "#4ECDC4", "#45B7D1", "#4F86C6", "#5E60CE", 
    "#7950F2", "#9775FA", "#C77DFF", "#E77FF3", "#F26ABC", 
    "#F868B3", "#FF66A3", "#A1A09E", "#6D6A75", "#6C757D"
  ];

  const handleFilterClick = (filterId: string) => {
    navigate(`/filters/${filterId}`);
  };

  const handleEditClick = (filter: FilterItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStandardFilter(filter.id)) {
      toast.error("Cannot modify standard filters");
      return;
    }
    setSelectedFilter(filter);
    setNewFilterName(filter.name);
    setFilterColor(filter.color || "");
    setIsEditFilterOpen(true);
  };

  const handleDeleteClick = (filter: FilterItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStandardFilter(filter.id)) {
      toast.error("Cannot delete standard filters");
      return;
    }
    setSelectedFilter(filter);
    setIsDeleteFilterOpen(true);
  };

  const handleFavoriteToggle = async (filter: FilterItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStandardFilter(filter.id)) {
      toast.error("Cannot modify standard filters");
      return;
    }
    
    try {
      const newValue = !filter.favorite;
      
      const { error } = await supabase
        .from('filters')
        .update({ favorite: newValue })
        .eq('id', filter.id);
        
      if (error) throw error;
      
      toast.success(newValue ? "Added to favorites" : "Removed from favorites");
    } catch (error: any) {
      toast.error("Failed to update filter", {
        description: error.message
      });
    }
  };

  const handleFilterRename = async () => {
    if (!selectedFilter) return;
    if (!newFilterName.trim()) {
      toast.error("Filter name is required");
      return;
    }

    try {
      const updateData: {
        name: string;
        color?: string;
      } = {
        name: newFilterName
      };
      
      if (filterColor) {
        updateData.color = filterColor;
      }
      
      const { error } = await supabase
        .from('filters')
        .update(updateData)
        .eq('id', selectedFilter.id);
        
      if (error) throw error;
      
      setIsEditFilterOpen(false);
      toast.success("Filter updated successfully");
    } catch (error: any) {
      toast.error("Failed to update filter", {
        description: error.message
      });
    }
  };

  const handleFilterDelete = async () => {
    if (!selectedFilter) return;
    
    try {
      const { error } = await supabase
        .from('filters')
        .delete()
        .eq('id', selectedFilter.id);
        
      if (error) throw error;
      
      setIsDeleteFilterOpen(false);
      toast.success("Filter deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete filter", {
        description: error.message
      });
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filters.map((filter) => (
          <Card 
            key={filter.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleFilterClick(filter.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle 
                  className="text-lg flex items-center gap-2"
                  style={{ color: filter.color || undefined }}
                >
                  <Filter className="h-5 w-5" style={{ color: filter.color || undefined }} />
                  {filter.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardFooter className="pt-2 flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => handleFavoriteToggle(filter, e)}
                disabled={isStandardFilter(filter.id)}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => handleEditClick(filter, e)}
                disabled={isStandardFilter(filter.id)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => handleDeleteClick(filter, e)}
                disabled={isStandardFilter(filter.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Filter Dialog */}
      <Dialog open={isEditFilterOpen} onOpenChange={setIsEditFilterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Filter</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="filter-name"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                placeholder="Enter filter name"
                autoFocus
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Filter Color</p>
              <IconPicker 
                colors={filterColors} 
                onChange={setFilterColor} 
                selectedColor={filterColor || ""} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFilterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFilterRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Filter Dialog */}
      <AlertDialog open={isDeleteFilterOpen} onOpenChange={setIsDeleteFilterOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this filter. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFilterDelete} 
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
