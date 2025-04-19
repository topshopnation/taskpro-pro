
import { useState, useCallback } from "react";
import { User } from "@/contexts/auth-context";
import { fetchUserProfile, mapProfileToUser } from "@/services/profile-service";

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);

  const updateUserFromSession = useCallback(async (
    userId: string,
    email?: string,
    avatarUrl?: string
  ) => {
    try {
      // If userId is not provided, reset the user state
      if (!userId) {
        setUser(null);
        return;
      }
      
      const profile = await fetchUserProfile(userId);
      const mappedUser = mapProfileToUser(userId, email, profile, avatarUrl);
      
      // If no first name is set, use email as display name
      if (!mappedUser.firstName && email) {
        mappedUser.firstName = email.split('@')[0];
      }
      
      setUser(mappedUser);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // If profile fetch fails, set basic user with email as first name
      if (userId && email) {
        setUser({
          id: userId,
          email: email,
          firstName: email ? email.split('@')[0] : undefined
        });
      } else {
        // If we don't have minimal user data, reset the user state
        setUser(null);
      }
    }
  }, []);

  return {
    user,
    setUser,
    updateUserFromSession
  };
};
