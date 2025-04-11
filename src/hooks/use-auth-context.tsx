
import { useContext } from "react";
import { AuthContext } from "@/contexts/auth-context";

/**
 * Hook to access authentication context
 * @returns Authentication context values and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
