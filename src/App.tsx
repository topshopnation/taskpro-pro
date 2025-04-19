
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import AppRoutes from "./AppRoutes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <SubscriptionProvider>
          <Toaster />
          <AppRoutes />
        </SubscriptionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
