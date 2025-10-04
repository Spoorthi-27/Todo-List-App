import { useState, useEffect } from 'react';
import { Plus, Moon, Sun } from 'lucide-react';
import { Task, TaskFormData, TaskStatus } from './types';
import { generateId, calculateTaskStats } from './utils/taskUtils';
import DashboardStats from './components/DashboardStats';
import TaskModal from './components/TaskModal';
import TaskList from './components/TaskList';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        })));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleCreateTask = (formData: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      startDate: new Date(formData.startDate),
      dueDate: new Date(formData.dueDate),
      completionPercentage: 0,
      status: 'pending',
      category: formData.category,
      priority: formData.priority,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const isCompleted = !task.isCompleted;
        return {
          ...task,
          isCompleted,
          completionPercentage: isCompleted ? 100 : task.completionPercentage,
          status: isCompleted ? 'completed' as TaskStatus :
                  task.completionPercentage > 0 ? 'in_progress' as TaskStatus : 'pending' as TaskStatus,
          updatedAt: new Date()
        };
      }
      return task;
    }));
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const status: TaskStatus = progress === 100 ? 'completed' :
                                   progress > 0 ? 'in_progress' : 'pending';
        return {
          ...task,
          completionPercentage: progress,
          status,
          isCompleted: progress === 100,
          updatedAt: new Date()
        };
      }
      return task;
    }));
  };

  const handleExportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = calculateTaskStats(tasks);

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-teal-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Task Manager
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Organize your work and boost productivity
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full transition-all ${
              darkMode
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
            }`}
            title="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>

        <DashboardStats stats={stats} />

        <TaskList
          tasks={tasks}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onUpdateProgress={handleUpdateProgress}
          onExport={handleExportTasks}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 z-40 group"
          title="Create new task"
        >
          <Plus className="w-8 h-8" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Create Task
          </span>
        </button>

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      </div>
    </div>
  );
}

export default App;
