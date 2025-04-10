
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function AppLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar className="hidden md:block" />
        <main className="flex-1 p-4 md:p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
