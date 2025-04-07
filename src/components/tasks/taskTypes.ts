
export interface TaskFormValues {
  title: string;
  notes: string;
  dueDate?: Date;
  priority: string;
  project: string;
  section: string;
}

export interface ProjectOption {
  id: string;
  name: string;
}
