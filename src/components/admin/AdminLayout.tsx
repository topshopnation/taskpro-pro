
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if admin session exists in localStorage
        const adminSessionStr = localStorage.getItem('admin_session');
        
        if (!adminSessionStr) {
          console.log('No admin session found, redirecting to admin login');
          navigate('/admin/login', { replace: true });
          return;
        }
        
        // Parse the admin session
        const adminSession = JSON.parse(adminSessionStr);
        
        // Check if session is valid (you might want to add expiration logic here)
        if (!adminSession.email) {
          console.error('Invalid admin session');
          localStorage.removeItem('admin_session');
          navigate('/admin/login', { replace: true });
          return;
        }
        
        console.log('Valid admin session found for:', adminSession.email);
        setAdminEmail(adminSession.email);
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast.error("Authentication error");
        localStorage.removeItem('admin_session');
        navigate('/admin/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader adminEmail={adminEmail} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
