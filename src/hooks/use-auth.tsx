
// This file is just for backward compatibility
// It re-exports the auth provider and hook from their new locations
import { AuthProvider } from "@/providers/auth-provider";
import { useAuth } from "@/hooks/use-auth-context";

export { AuthProvider, useAuth };
