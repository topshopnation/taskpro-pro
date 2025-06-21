
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  CreditCard,
  Settings,
  BarChart3,
  Database,
  History,
  LogOut
} from "lucide-react";
import { toast } from "sonner";

const menuItems = [
  { 
    name: "Dashboard", 
    path: "/admin", 
    icon: <BarChart3 className="h-5 w-5" /> 
  },
  { 
    name: "Users", 
    path: "/admin/users", 
    icon: <Users className="h-5 w-5" /> 
  },
  { 
    name: "Subscriptions", 
    path: "/admin/subscriptions", 
    icon: <CreditCard className="h-5 w-5" /> 
  },
  { 
    name: "Activity Logs", 
    path: "/admin/activity", 
    icon: <History className="h-5 w-5" /> 
  },
  { 
    name: "Database", 
    path: "/admin/database", 
    icon: <Database className="h-5 w-5" /> 
  },
  { 
    name: "Settings", 
    path: "/admin/settings", 
    icon: <Settings className="h-5 w-5" /> 
  }
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogout = () => {
    // Clear admin session
    localStorage.removeItem('admin_session');
    toast.success("Signed out of admin portal");
    navigate('/admin/login');
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">TaskPro Admin</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <button
          onClick={handleAdminLogout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
