
import { useState, useCallback } from "react";
import { User } from "@/contexts/auth-context";
import { fetchUserProfile, mapProfileToUser } from "@/services/profile-service";

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);

  const updateUserFromSession = useCallback(async (
    userId?: string,
    email?: string,
    avatarUrl?: string
  ) => {
    try {
      // If userId is not provided, reset the user state
      if (!userId) {
        console.log("No userId provided, resetting user state");
        setUser(null);
        return;
      }
      
      const profile = await fetchUserProfile(userId);
      const mappedUser = mapProfileToUser(userId, email, profile, avatarUrl);
      
      // Only set the user if we have a valid userId to prevent mock users
      if (userId) {
        setUser(mappedUser);
      } else {
        setUser(null);
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
