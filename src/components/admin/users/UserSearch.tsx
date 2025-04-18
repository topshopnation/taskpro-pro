
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function UserSearch({ searchQuery, setSearchQuery }: UserSearchProps) {
  return (
    <div className="relative mt-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search users by name or email..." 
        className="pl-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
