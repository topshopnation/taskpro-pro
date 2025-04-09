
import { createContext } from "react";
import { Session } from "@supabase/supabase-js";

export type User = {
  id: string;
  email?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
