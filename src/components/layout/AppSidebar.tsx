
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import AppSidebarContainer from "@/components/sidebar/SidebarContainer";

interface Project {
  id: string;
  name: string;
  favorite: boolean;
}

interface FilterItem {
  id: string;
  name: string;
  favorite: boolean;
}

interface DatabaseFilter {
  id: string;
  name: string;
  user_id: string;
  conditions: Json;
  created_at: string;
  updated_at: string;
  favorite?: boolean;
}

interface FavoriteItem extends Project {
  type: 'project' | 'filter';
}

interface AppSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function AppSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: AppSidebarProps) {
  return (
    <AppSidebarContainer 
      isMobileMenuOpen={isMobileMenuOpen} 
      setIsMobileMenuOpen={setIsMobileMenuOpen} 
    />
  );
}
