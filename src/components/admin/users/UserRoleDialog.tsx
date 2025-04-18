
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AdminRole } from "@/types/adminTypes";

interface UserRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: any;
  newRole: AdminRole;
  setNewRole: (role: AdminRole) => void;
  onUpdate: () => void;
}

export function UserRoleDialog({ 
  isOpen, 
  onOpenChange, 
  selectedUser, 
  newRole, 
  setNewRole, 
  onUpdate 
}: UserRoleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {selectedUser?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Role</label>
              <Select value={newRole} onValueChange={(value: AdminRole) => setNewRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onUpdate}>
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
