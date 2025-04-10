
export interface TaskFormValues {
  title: string;
  notes: string;
  dueDate?: Date;
  project: string;
  priority: number;
  tags: string[];
}

export interface ProjectOption {
  id: string;
  name: string;
  color?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  user_id: string;
}

export interface TaskTagRelation {
  id: string;
  task_id: string;
  tag_id: string;
}
