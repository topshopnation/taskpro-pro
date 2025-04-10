export interface TaskFormValues {
  title: string;
  notes: string;
  dueDate?: Date;
  priority: string;
  project: string;
  tags: string[];
}

export interface ProjectOption {
  id: string;
  name: string;
}

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
