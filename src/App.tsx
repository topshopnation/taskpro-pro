
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { useNativeFeatures } from "@/hooks/useNativeFeatures";
import AppRoutes from "./AppRoutes";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isNative } = useNativeFeatures();

  return (
    <div className={`min-h-screen ${isNative ? 'native-app' : ''}`}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <SubscriptionProvider>
              <Toaster />
              <AppRoutes />
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
