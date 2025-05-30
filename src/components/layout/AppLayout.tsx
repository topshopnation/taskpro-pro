
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { SubscriptionRestriction } from "@/components/subscription/SubscriptionRestriction";
import { useSubscriptionCheck } from "@/hooks/use-subscription-check";

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { shouldRestrict } = useSubscriptionCheck();
  
  // Log navigation for debugging
  useEffect(() => {
    console.log("AppLayout rendering at path:", location.pathname);
  }, [location.pathname]);

  const content = children || <Outlet />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full safe-area-layout">
        <AppHeader />
        <div className="flex flex-1 w-full">
          <AppSidebar className="hidden md:block" />
          <main className="flex-1 p-3 md:p-6 overflow-x-hidden pb-safe">
            {shouldRestrict ? (
              <SubscriptionRestriction>
                {content}
              </SubscriptionRestriction>
            ) : (
              content
            )}
          </main>
        </div>
        
        {/* Adding Toaster for notifications */}
        <Toaster 
          position="bottom-right"
          duration={3000}
          richColors
          closeButton
        />
      </div>
    </SidebarProvider>
  );
}
