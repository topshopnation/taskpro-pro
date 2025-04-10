
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Stats from "./pages/Stats";
import ProjectView from "./pages/ProjectView";
import ProjectsPage from "./pages/ProjectsPage";
import FilterView from "./pages/FilterView";
import FiltersPage from "./pages/FiltersPage";
import InboxView from "./pages/InboxView";
import TodayView from "./pages/TodayView";
import OverdueView from "./pages/OverdueView";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import { AuthProvider } from "./providers/auth-provider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import CompletedTasks from "./pages/CompletedTasks";
import { queryClient } from "./lib/react-query";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="taskpro-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<Navigate to="/today" replace />} />
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><InboxView /></ProtectedRoute>} />
              <Route path="/today" element={<ProtectedRoute><TodayView /></ProtectedRoute>} />
              <Route path="/overdue" element={<ProtectedRoute><OverdueView /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
              <Route path="/projects/:id" element={<ProtectedRoute><ProjectView /></ProtectedRoute>} />
              <Route path="/filters" element={<ProtectedRoute><FiltersPage /></ProtectedRoute>} />
              <Route path="/filters/:id" element={<ProtectedRoute><FilterView /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/completed" element={<ProtectedRoute><CompletedTasks /></ProtectedRoute>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
