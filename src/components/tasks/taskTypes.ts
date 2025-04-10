
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
