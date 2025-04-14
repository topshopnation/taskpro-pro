
import { AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar/sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";

export function AppHeader({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <header className={cn("border-b bg-background", className)} {...props}>
      <div className="flex h-14 items-center px-4 md:px-6">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 md:hidden"
            onClick={() => toggleSidebar()}
          >
            <AlignLeft className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        
        <div className="flex-1" />
        
        <SubscriptionStatus />
      </div>
    </header>
  );
}
