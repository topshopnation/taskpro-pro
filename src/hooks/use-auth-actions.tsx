
import { Provider } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/contexts/auth-context";
import { fetchUserProfile } from "@/utils/auth-utils";

export function useAuthActions(setUser: React.Dispatch<React.SetStateAction<User | null>>) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with email/password");
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Immediately update state to prevent hanging
      if (data?.session?.user) {
        await updateUserState(data.session.user);
      }

      toast({
        title: "Signed in",
        description: "You have successfully signed in.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Signing up with email/password");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Signed up",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out");
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Navigate to home page after signout
      navigate("/");
      
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      console.log(`Signing in with ${provider}`);
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log("Using redirect URL:", redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          // Add scopes that might be needed
          scopes: provider === 'github' ? 'user:email' : undefined,
        },
      });

      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => {
    try {
      // Show a loading toast
      toast({
        title: "Updating profile...",
        description: "Please wait while your profile is being updated.",
      });

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.data.user.id);

      if (error) throw error;

      // Update local state by fetching the updated user
      await updateUserState(user.data.user);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Helper function to update user state
  const updateUserState = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    const profile = await fetchUserProfile(authUser.id);
    
    setUser({
      id: authUser.id,
      email: authUser.email,
      avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      firstName: profile?.first_name,
      lastName: profile?.last_name,
    });
  };

  return {
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    updateProfile
  };
}
