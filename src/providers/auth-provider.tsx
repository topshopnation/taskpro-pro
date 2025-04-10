
import { AuthContext } from "@/contexts/auth-context";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useAuthActions } from "@/hooks/use-auth-actions";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, session, loading, setUser } = useAuthSession();
  const { signIn, signUp, signOut, signInWithProvider, updateProfile } = useAuthActions(setUser);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        signInWithProvider, 
        updateProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
