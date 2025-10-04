import { CheckCircle2, Clock, AlertCircle, ListTodo, TrendingUp } from 'lucide-react';
import { TaskStats } from '../types';

interface DashboardStatsProps {
  stats: TaskStats;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTasks}</p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <ListTodo className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedTasks}</p>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgressTasks}</p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdueTasks}</p>
          </div>
          <div className="bg-red-100 rounded-full p-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Progress</p>
            <p className="text-3xl font-bold text-teal-600 mt-2">{stats.completionPercentage}%</p>
          </div>
          <div className="bg-teal-100 rounded-full p-3">
            <TrendingUp className="w-6 h-6 text-teal-600" />
          </div>
        </div>
        <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
