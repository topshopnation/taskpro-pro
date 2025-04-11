
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

export interface TaskFormValues {
  title: string;
  notes: string;
  dueDate?: Date;
  dueTime?: string;
  priority: string;
  project: string;
  tags: string[];
}
