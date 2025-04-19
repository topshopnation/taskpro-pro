
import { useState, useCallback } from "react";
import { User } from "@/contexts/auth-context";
import { fetchUserProfile, mapProfileToUser } from "@/services/profile-service";

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);

  // Completely reset user state
  const resetUser = useCallback(() => {
    console.log("Explicitly resetting user state to null");
    setUser(null);
  }, []);

  const updateUserFromSession = useCallback(async (
    userId?: string,
    email?: string,
    avatarUrl?: string
  ) => {
    try {
      // If userId is not provided, reset user state completely
      if (!userId) {
        console.log("No userId provided, explicitly resetting user state");
        resetUser();
        return;
      }
      
      const profile = await fetchUserProfile(userId);
      
      // Only set user if we have a valid profile to prevent mock users
      if (profile) {
        const mappedUser = mapProfileToUser(userId, email, profile, avatarUrl);
        setUser(mappedUser);
      } else {
        // If no profile exists but we have basic data, we'll still create a minimal user
        // but log this as a potential issue
        if (userId && email) {
          console.log("Warning: Setting minimal user data because profile fetch returned null");
          setUser({
            id: userId,
            email: email,
            firstName: email ? email.split('@')[0] : undefined
          });
        } else {
          console.log("No valid user profile or minimal data, resetting user state");
          resetUser();
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // If profile fetch fails but we have minimal user data, set basic user
      if (userId && email) {
        console.log("Setting minimal user data after profile fetch failure");
        setUser({
          id: userId,
          email: email,
          firstName: email ? email.split('@')[0] : undefined
        });
      } else {
        // If we don't have minimal user data, reset the user state
        console.log("No minimal user data available, resetting user state");
        resetUser();
      }
    }
  }, [resetUser]);

  return {
    user,
    setUser,
    resetUser,
    updateUserFromSession
  };
};
