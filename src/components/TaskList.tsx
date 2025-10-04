import { ArrowUpDown, Search, Filter, Download, Import as SortAsc, Dessert as SortDesc } from 'lucide-react';
import { useState } from 'react';
import { Task, SortOption, SortOrder, TaskStatus } from '../types';
import { sortTasks } from '../utils/taskUtils';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onExport: () => void;
}

export default function TaskList({ tasks, onDelete, onToggleComplete, onUpdateProgress, onExport }: TaskListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedTasks = sortTasks(filteredTasks, sortBy, sortOrder);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <ArrowUpDown className="w-5 h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer"
              >
                <option value="alphabetical">Alphabetical</option>
                <option value="start_date">Start Date</option>
                <option value="due_date">Due Date</option>
                <option value="completion">Progress</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <button
              onClick={toggleSortOrder}
              className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:bg-gray-100 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-5 h-5 text-gray-600" />
              ) : (
                <SortDesc className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <button
              onClick={onExport}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              title="Export tasks"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-3 text-sm text-gray-600">
          <span className="font-medium">Showing:</span>
          <span>{sortedTasks.length} of {tasks.length} tasks</span>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Click the + button to create your first task'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              onUpdateProgress={onUpdateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
