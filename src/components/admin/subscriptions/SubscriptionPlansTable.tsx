
import { SubscriptionPlan } from "@/types/adminTypes";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface SubscriptionPlansTableProps {
  plans: SubscriptionPlan[];
  onEdit: (plan: SubscriptionPlan) => void;
  onDuplicate: (plan: SubscriptionPlan) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionPlansTable({
  plans,
  onEdit,
  onDuplicate,
  onDelete
}: SubscriptionPlansTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Monthly Price</TableHead>
          <TableHead>Yearly Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map(plan => (
          <TableRow key={plan.id}>
            <TableCell>
              <div>
                <div className="font-medium">{plan.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {plan.description}
                </div>
              </div>
            </TableCell>
            <TableCell>${plan.price_monthly.toFixed(2)}</TableCell>
            <TableCell>${plan.price_yearly.toFixed(2)}</TableCell>
            <TableCell>
              {plan.is_active ? (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </TableCell>
            <TableCell>{format(new Date(plan.created_at), "MMM dd, yyyy")}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(plan)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(plan)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(plan.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
