
import { AuthContext, AuthContextType } from "@/contexts/auth-context";
import { useAuthState } from "@/hooks/use-auth-state";
import { signUp, signIn, signOut, signInWithProvider, updateUserProfile } from "@/services/auth-service";
import { useNavigate } from "react-router-dom";

export function AuthProviderImpl({ children }: { children: React.ReactNode }) {
  const { user, setUser, session, loading } = useAuthState();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      
      // Force user state to null regardless of API success
      setUser(null);
      
      // Let the user navigate to auth page
      // The navigation will be handled in the SignOutCard component
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      
      // Even if the API call fails, clear the user state
      setUser(null);
      
      // We'll rethrow so component-level error handling can navigate
      throw error;
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
      console.error('Error in handleUpdateProfile:', error);
      throw error; // Rethrow to allow component-level error handling
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
