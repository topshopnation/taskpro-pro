
import { useState, useEffect } from "react";
import { X, Tag as TagIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Tag } from "./taskTypes";

interface TagInputProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const { user } = useAuth();

  // Fetch existing tags
  useEffect(() => {
    const fetchTags = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Use type assertion to bypass TypeScript constraints
        const { data, error } = await (supabase as any)
          .from('tags')
          .select('id, name, color')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setTags(data || []);
      } catch (error: any) {
        toast.error("Failed to load tags", {
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, [user]);

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !user) return;
    
    try {
      // Check if tag already exists
      const tagExists = tags.some(tag => 
        tag.name.toLowerCase() === newTagName.toLowerCase()
      );
      
      if (tagExists) {
        toast.error("A tag with this name already exists");
        return;
      }
      
      // Use type assertion to bypass TypeScript constraints
      const { data, error } = await (supabase as any)
        .from('tags')
        .insert({
          name: newTagName.trim(),
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add new tag to the list
      setTags([...tags, data]);
      
      // Select the new tag
      onChange([...selectedTags, data.id]);
      
      // Reset form
      setNewTagName("");
      setShowTagInput(false);
      
      toast.success("Tag created");
    } catch (error: any) {
      toast.error("Failed to create tag", {
        description: error.message
      });
    }
  };

  const handleSelectTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  const getTagById = (tagId: string) => {
    return tags.find(tag => tag.id === tagId);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tagId => {
          const tag = getTagById(tagId);
          if (!tag) return null;
          
          return (
            <Badge 
              key={tag.id} 
              variant="secondary"
              className="flex items-center gap-1 py-1"
            >
              <TagIcon className="h-3 w-3" />
              {tag.name}
              <button
                type="button"
                onClick={() => handleSelectTag(tag.id)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag.name}</span>
              </button>
            </Badge>
          );
        })}
      </div>
      
      {showTagInput ? (
        <div className="flex gap-2">
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCreateTag}
            disabled={!newTagName.trim()}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowTagInput(false);
              setNewTagName("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
            <Badge 
              key={tag.id} 
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => handleSelectTag(tag.id)}
            >
              <TagIcon className="mr-1 h-3 w-3" />
              {tag.name}
            </Badge>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6"
            onClick={() => setShowTagInput(true)}
          >
            <Plus className="mr-1 h-3 w-3" />
            New Tag
          </Button>
        </div>
      )}
    </div>
  );
}
