
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchTasks } from "@/hooks/useSearchTasks";
import { Task } from "@/components/tasks/TaskItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchTaskItem } from "./SearchTaskItem";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { results, isLoading } = useSearchTasks(searchQuery);
  
  // Clear search query when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search Tasks</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {searchQuery.length > 0 
                ? "No tasks found" 
                : "Start typing to search tasks"}
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1">
                {results.map((task: Task) => (
                  <SearchTaskItem 
                    key={task.id} 
                    task={task} 
                    onOpenChange={onOpenChange}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
