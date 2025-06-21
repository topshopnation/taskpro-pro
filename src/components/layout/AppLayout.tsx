
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { SubscriptionRestriction } from "@/components/subscription/SubscriptionRestriction";
import { useSubscriptionCheck } from "@/hooks/use-subscription-check";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { shouldRestrict, loading: subscriptionLoading } = useSubscriptionCheck();
  
  // Log navigation for debugging
  useEffect(() => {
    console.log("AppLayout rendering at path:", location.pathname, "shouldRestrict:", shouldRestrict);
  }, [location.pathname, shouldRestrict]);

  const content = children || <Outlet />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full safe-area-layout">
        <AppHeader />
        <div className="flex flex-1 w-full">
          <AppSidebar className="hidden md:block" />
          <main className="flex-1 p-3 md:p-6 overflow-x-hidden pb-safe">
            {!subscriptionLoading && shouldRestrict ? (
              <SubscriptionRestriction>
                {content}
              </SubscriptionRestriction>
            ) : (
              content
            )}
          </main>
        </div>
        
        <Toaster 
          position="bottom-right"
          duration={3000}
          richColors
          closeButton
        />
        
        <InstallPrompt />
      </div>
    </SidebarProvider>
  );
}
