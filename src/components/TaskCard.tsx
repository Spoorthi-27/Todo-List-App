import { Calendar, Clock, Trash2, CreditCard as Edit2, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../types';
import { formatDate, getCategoryColor, getPriorityColor, isTaskOverdue } from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}

export default function TaskCard({ task, onDelete, onToggleComplete, onUpdateProgress }: TaskCardProps) {
  const isOverdue = isTaskOverdue(task);
  const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 p-5 hover:shadow-lg transition-all ${
      isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
    } ${task.isCompleted ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 transition-transform hover:scale-110"
          >
            {task.isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600" />
            )}
          </button>
          <div className="flex-1">
            <h3 className={`text-lg font-bold mb-1 ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} title={`${task.priority} priority`} />
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
            title="Delete task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(task.category)}`}>
            {task.category}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status.replace('_', ' ')}
          </span>
          {isOverdue && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
              Overdue
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Start:</span>
            <span>{formatDate(task.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Due:</span>
            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>

        {!task.isCompleted && daysUntilDue >= 0 && daysUntilDue <= 7 && (
          <div className="text-sm text-amber-600 font-medium">
            Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm font-bold text-blue-600">{task.completionPercentage}%</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={task.completionPercentage}
              onChange={(e) => onUpdateProgress(task.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={task.isCompleted}
            />
            <div
              className="absolute top-0 left-0 h-2 bg-blue-600 rounded-lg pointer-events-none transition-all"
              style={{ width: `${task.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
