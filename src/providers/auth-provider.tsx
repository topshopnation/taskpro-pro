
import { AuthProviderImpl } from "@/providers/auth-provider-impl";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProviderImpl>{children}</AuthProviderImpl>;
}
