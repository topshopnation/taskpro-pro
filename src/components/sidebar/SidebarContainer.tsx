
import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SidebarContent } from "@/components/sidebar/SidebarContent";

interface SidebarContainerProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const AppSidebarContainer = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: SidebarContainerProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Trigger */}
      <div className="fixed bottom-6 left-6 z-40 block md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full bg-background shadow-md"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex h-full flex-col">
            <div className="h-full p-4 pt-0">
              <SidebarContent onMobileMenuClose={() => setIsMobileMenuOpen(false)} />
            </div>
            <div className="p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Close Menu
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground md:block">
        <div className="flex h-full flex-col">
          <div className="p-4">
            <SidebarContent onMobileMenuClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebarContainer;
