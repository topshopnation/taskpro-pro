
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UserPaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  startIdx: number;
  endIdx: number;
  totalItems: number;
}

export function UserPagination({ 
  page, 
  setPage, 
  totalPages, 
  startIdx, 
  endIdx, 
  totalItems 
}: UserPaginationProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-muted-foreground">
        Showing {Math.min(totalItems, startIdx + 1)} to {Math.min(totalItems, endIdx)} of {totalItems} users
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
