
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import TodayView from "./pages/TodayView";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectView from "./pages/ProjectView";
import FiltersPage from "./pages/FiltersPage";
import FilterView from "./pages/FilterView";
import InboxView from "./pages/InboxView";
import CompletedTasks from "./pages/CompletedTasks";
import OverdueView from "./pages/OverdueView";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Stats from "./pages/Stats";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersAdmin from "./pages/admin/UsersAdmin";
import SubscriptionsAdmin from "./pages/admin/SubscriptionsAdmin";
import ActivityAdmin from "./pages/admin/ActivityAdmin";
import AdminAuth from "./pages/AdminAuth";
import { AuthProvider } from "@/providers/auth-provider";

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="*" element={<ProtectedRoute />}>
            <Route path="today" element={<TodayView />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id/:name" element={<ProjectView />} />
            <Route path="filters" element={<FiltersPage />} />
            <Route path="filters/:id/:name" element={<FilterView />} />
            <Route path="inbox" element={<InboxView />} />
            <Route path="completed" element={<CompletedTasks />} />
            <Route path="overdue" element={<OverdueView />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="stats" element={<Stats />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<UsersAdmin />} />
            <Route path="admin/subscriptions" element={<SubscriptionsAdmin />} />
            <Route path="admin/activity" element={<ActivityAdmin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
