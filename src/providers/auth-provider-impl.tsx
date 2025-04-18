
import { AuthContext, AuthContextType } from "@/contexts/auth-context";
import { useAuthState } from "@/hooks/use-auth-state";
import { signUp, signIn, signOut, signInWithProvider, updateUserProfile } from "@/services/auth-service";

export function AuthProviderImpl({ children }: { children: React.ReactNode }) {
  const { user, setUser, session, loading } = useAuthState();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Remove navigate dependency - we'll let the auth state change redirect instead
    } catch (error) {
      // Error is already handled in the service
      console.error('Error in handleSignOut:', error);
    }
  };

  const handleUpdateProfile = async (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => {
    try {
      if (!user?.id) throw new Error("Not authenticated");
      
      await updateUserProfile(user.id, data);
      
      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          avatarUrl: data.avatarUrl || prev.avatarUrl
        };
      });
    } catch (error) {
      // Error is already handled in the service
      console.error('Error in handleUpdateProfile:', error);
    }
  };

  const authContextValue: AuthContextType = {
    user, 
    session, 
    signUp, 
    signIn, 
    signOut: handleSignOut, 
    signInWithProvider, 
    updateProfile: handleUpdateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
