export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskCategory = 'work' | 'personal' | 'urgent' | 'other';
export type TaskPriority = 'high' | 'medium' | 'low';
export type SortOption = 'alphabetical' | 'start_date' | 'due_date' | 'completion' | 'priority';
export type SortOrder = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  dueDate: Date;
  completionPercentage: number;
  status: TaskStatus;
  category: TaskCategory;
  priority: TaskPriority;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFormData {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  category: TaskCategory;
  priority: TaskPriority;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionPercentage: number;
}
