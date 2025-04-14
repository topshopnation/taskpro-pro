
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
      const profile = await fetchUserProfile(userId);
      setUser(mapProfileToUser(userId, email, profile, avatarUrl));
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setUser({
        id: userId,
        email: email,
      });
    }
  }, []);

  return {
    user,
    setUser,
    updateUserFromSession
  };
};
