
import { AuthContext, AuthContextType } from "@/contexts/auth-context";
import { useAuthState } from "@/hooks/use-auth-state";
import { signUp, signIn, signOut, signInWithProvider, updateUserProfile } from "@/services/auth-service";

export function AuthProviderImpl({ children }: { children: React.ReactNode }) {
  const { user, setUser, session, loading } = useAuthState();

  const handleSignOut = async () => {
    try {
      // Clear user state first to prevent UI flicker with wrong data
      setUser(null);
      
      // Then perform the actual signout
      await signOut();
      
      // Force a complete clearing of all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear Supabase cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      });
      
      console.log("User signed out successfully, user state cleared");
      
      // Navigation will be handled in the SignOutCard component
    } catch (error) {
      console.error('Error in handleSignOut:', error);
      
      // Even if the API call fails, clear the user state
      setUser(null);
      
      // Force storage clearing
      localStorage.clear();
      sessionStorage.clear();
      
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
