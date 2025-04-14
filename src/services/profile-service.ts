
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/contexts/auth-context";

export type UserProfile = {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    toast.error("Failed to fetch user profile");
    return null;
  }
};

export const mapProfileToUser = (
  userId: string, 
  email: string | undefined, 
  profile: UserProfile | null, 
  avatarUrl?: string
): User => ({
  id: userId,
  email: email,
  firstName: profile?.first_name,
  lastName: profile?.last_name,
  avatarUrl: profile?.avatar_url || avatarUrl,
});
