import { Task, TaskStats, SortOption, SortOrder } from '../types';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => !t.isCompleted && new Date(t.dueDate) < new Date()).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    overdueTasks,
    completionPercentage
  };
};

export const sortTasks = (tasks: Task[], sortBy: SortOption, order: SortOrder): Task[] => {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'alphabetical':
        comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        break;
      case 'start_date':
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case 'due_date':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'completion':
        comparison = a.completionPercentage - b.completionPercentage;
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

export const isTaskOverdue = (task: Task): boolean => {
  return !task.isCompleted && new Date(task.dueDate) < new Date();
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatDateTime = (date: Date): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getCategoryColor = (category: string): string => {
  const colors = {
    work: 'bg-blue-100 text-blue-800 border-blue-300',
    personal: 'bg-green-100 text-green-800 border-green-300',
    urgent: 'bg-red-100 text-red-800 border-red-300',
    other: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  return colors[category as keyof typeof colors] || colors.other;
};

export const getPriorityColor = (priority: string): string => {
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

export const getStatusColor = (status: string): string => {
  const colors = {
    pending: 'text-gray-600',
    in_progress: 'text-blue-600',
    completed: 'text-green-600'
  };
  return colors[status as keyof typeof colors] || colors.pending;
};
