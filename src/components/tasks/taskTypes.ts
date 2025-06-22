
export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface TaskTagRelation {
  task_id: string;
  tag_id: string;
  user_id: string;
}

export type TaskPriority = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: Date;
  dueTime?: string;
  priority: TaskPriority;
  projectId?: string;
  projectName?: string;
  projectColor?: string;
  section?: string;
  completed: boolean;
  favorite: boolean;
}

export interface TaskFormValues {
  title: string;
  notes: string;
  dueDate?: Date;
  dueTime?: string;
  priority: string;
  project: string;
  tags: string[];
}

export interface ProjectOption {
  id: string;
  name: string;
  color?: string;
}
