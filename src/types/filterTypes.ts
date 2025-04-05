
import { Task } from "@/components/tasks/TaskItem";
import { Filter } from "@/types/supabase";

export interface CustomFilter extends Omit<Filter, 'favorite'> {
  id: string;
  name: string;
  conditions: any;
  logic: string;
  favorite: boolean;
}

export const standardFilters: CustomFilter[] = [
  { 
    id: "today", 
    name: "Today", 
    conditions: [{ type: "due", operator: "equals", value: "today" }],
    logic: "and",
    favorite: true,
    user_id: "",
    created_at: "",
    updated_at: ""
  },
  { 
    id: "upcoming", 
    name: "Upcoming", 
    conditions: [{ type: "due", operator: "equals", value: "this_week" }],
    logic: "and",
    favorite: false,
    user_id: "",
    created_at: "",
    updated_at: ""
  },
  { 
    id: "priority1", 
    name: "Priority 1", 
    conditions: [{ type: "priority", operator: "equals", value: "1" }],
    logic: "and",
    favorite: false,
    user_id: "",
    created_at: "",
    updated_at: ""
  },
];
