
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full">
        <AppHeader />
        <div className="flex flex-1 w-full">
          <AppSidebar className="hidden md:block" />
          <main className="flex-1 p-3 md:p-6 overflow-x-hidden">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
