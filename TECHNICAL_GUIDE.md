# Task Manager - Technical Implementation Guide

## Architecture Overview

Task Manager is built using a modern React architecture with functional components, hooks, and TypeScript for type safety.

```
┌─────────────────────────────────────────┐
│            App.tsx (Root)               │
│  - State Management                     │
│  - Data Persistence                     │
│  - Event Handlers                       │
└───────────┬─────────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐    ┌──────────┐
│Dashboard│    │TaskModal │
│  Stats  │    │          │
└─────────┘    └──────────┘
                    │
                    ▼
            ┌──────────────┐
            │  TaskList    │
            │  + Filters   │
            │  + Search    │
            │  + Sort      │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │  TaskCard    │
            │  (Multiple)  │
            └──────────────┘
```

## State Management

### Root State (App.tsx)

```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [darkMode, setDarkMode] = useState(false);
```

**Why at root level?**
- Tasks need to be shared across multiple components
- Single source of truth for all task data
- Easier to persist to localStorage
- Simpler data flow (no prop drilling beyond one level)

### Local State (Components)

Each component manages its own UI state:
- **TaskList**: sort options, filters, search query
- **TaskModal**: form data, validation errors
- **TaskCard**: (currently stateless, receives all via props)

## Data Flow Patterns

### Top-Down Data Flow

```
User clicks "Create Task"
    ↓
TaskModal collects form data
    ↓
onSubmit callback fires
    ↓
App.handleCreateTask() processes data
    ↓
setTasks() updates state
    ↓
React re-renders affected components
    ↓
TaskList receives new tasks
    ↓
TaskCard components render
```

### Event Bubbling

```
User clicks delete on TaskCard
    ↓
TaskCard.onDelete(taskId) fires
    ↓
TaskList.onDelete(taskId) forwards
    ↓
App.handleDeleteTask(taskId) executes
    ↓
Confirmation dialog appears
    ↓
If confirmed: state updates
    ↓
TaskCard unmounts (React removes it)
```

## Type System

### Core Types

```typescript
// Literal types for strict validation
type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskCategory = 'work' | 'personal' | 'urgent' | 'other';
type TaskPriority = 'high' | 'medium' | 'low';
type SortOption = 'alphabetical' | 'start_date' | 'due_date' | 'completion' | 'priority';
type SortOrder = 'asc' | 'desc';
```

**Benefits:**
- Autocomplete in IDE
- Compile-time error detection
- Self-documenting code
- Prevents invalid values

### Interface Design

```typescript
interface Task {
  // Identifiers
  id: string;

  // Core data
  title: string;
  description: string;

  // Temporal data
  startDate: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;

  // Progress tracking
  completionPercentage: number;
  status: TaskStatus;
  isCompleted: boolean;

  // Organization
  category: TaskCategory;
  priority: TaskPriority;
}
```

**Design decisions:**
- `Date` objects for proper date handling
- Both `isCompleted` and `status` for flexibility
- `completionPercentage` as number (0-100)
- All optional fields have defaults

## Component Deep Dive

### App.tsx

**Responsibilities:**
1. Managing global task state
2. Providing CRUD operations
3. Data persistence (localStorage)
4. Coordinating child components

**Key Functions:**

#### handleCreateTask
```typescript
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
```

**Process:**
1. Receives form data from modal
2. Generates unique ID
3. Converts date strings to Date objects
4. Sets defaults for completion tracking
5. Adds timestamps
6. Appends to tasks array

#### handleUpdateProgress
```typescript
const handleUpdateProgress = (id: string, progress: number) => {
  setTasks(tasks.map(task => {
    if (task.id === id) {
      const status: TaskStatus =
        progress === 100 ? 'completed' :
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
```

**Logic:**
1. Find task by ID
2. Determine new status based on progress
3. Update completion flag if 100%
4. Set new timestamp
5. Return updated task array

### DashboardStats.tsx

**Purpose:** Display aggregated metrics

**Props:**
```typescript
interface DashboardStatsProps {
  stats: TaskStats;
}
```

**Rendering Strategy:**
- Static layout (5 cards)
- Dynamic data (from props)
- No local state needed
- Pure presentation component

**Optimization opportunity:**
```typescript
// Could memoize if stats calculation becomes expensive
const DashboardStats = React.memo(({ stats }: DashboardStatsProps) => {
  // Component code
});
```

### TaskModal.tsx

**Purpose:** Task creation form with validation

**Local State:**
```typescript
const [formData, setFormData] = useState<TaskFormData>({
  title: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  category: 'other',
  priority: 'medium'
});

const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
```

**Validation Logic:**
```typescript
const validate = (): boolean => {
  const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

  if (!formData.title.trim()) {
    newErrors.title = 'Title is required';
  }

  if (new Date(formData.dueDate) < new Date(formData.startDate)) {
    newErrors.dueDate = 'Due date must be after start date';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Form Reset:**
After successful submission, reset to defaults:
```typescript
setFormData({
  title: '',
  description: '',
  startDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  category: 'other',
  priority: 'medium'
});
setErrors({});
```

### TaskCard.tsx

**Purpose:** Display individual task with controls

**Props Interface:**
```typescript
interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}
```

**Computed Values:**
```typescript
const isOverdue = isTaskOverdue(task);
const daysUntilDue = Math.ceil(
  (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
);
```

**Conditional Styling:**
```typescript
className={`bg-white rounded-xl shadow-sm border-2 p-5 hover:shadow-lg transition-all ${
  isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
} ${task.isCompleted ? 'opacity-75' : ''}`}
```

**Benefits:**
- Visual feedback for overdue tasks
- Completed tasks less prominent
- Smooth hover transitions

### TaskList.tsx

**Purpose:** Display filtered/sorted tasks with controls

**Local State:**
```typescript
const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
const [searchQuery, setSearchQuery] = useState('');
const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
```

**Filtering Logic:**
```typescript
const filteredTasks = tasks.filter(task => {
  const matchesSearch =
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesFilter =
    filterStatus === 'all' || task.status === filterStatus;

  return matchesSearch && matchesFilter;
});
```

**Sorting Application:**
```typescript
const sortedTasks = sortTasks(filteredTasks, sortBy, sortOrder);
```

**Performance Note:**
Filtering and sorting happen on every render. For large task lists (1000+), consider:
- `useMemo` hook to cache results
- Virtual scrolling for rendering
- Debouncing search input

## Utility Functions (taskUtils.ts)

### generateId()
```typescript
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```

**Why this approach?**
- Timestamp ensures chronological ordering
- Random suffix prevents collisions
- No external dependencies
- Good enough for client-side use
- For production with Supabase: use UUID

### calculateTaskStats()
```typescript
export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t =>
    !t.isCompleted && new Date(t.dueDate) < new Date()
  ).length;
  const completionPercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    overdueTasks,
    completionPercentage
  };
};
```

**Optimization:** Runs on every render when tasks change. Consider memoization:
```typescript
const stats = useMemo(() => calculateTaskStats(tasks), [tasks]);
```

### sortTasks()
```typescript
export const sortTasks = (tasks: Task[], sortBy: SortOption, order: SortOrder): Task[] => {
  const sorted = [...tasks]; // Create copy to avoid mutation

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
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};
```

**Key points:**
- Creates copy to avoid mutating original array
- Uses `localeCompare` for proper string sorting
- Converts dates to timestamps for numeric comparison
- Priority sorting is descending by default (high first)
- Order toggle applies to all sort types

## Data Persistence

### LocalStorage Implementation

**Save on Change:**
```typescript
useEffect(() => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}, [tasks]);
```

**Load on Mount:**
```typescript
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
```

**Important considerations:**
- Dates are stored as ISO strings in localStorage
- Must convert back to Date objects on load
- Try-catch prevents app crash if data is corrupted
- Empty dependency array = runs once on mount

### Supabase Migration Path

**When integrating Supabase:**

1. **Create API service:**
```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const taskService = {
  async getAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ... other CRUD operations
};
```

2. **Update App.tsx:**
```typescript
useEffect(() => {
  // Load from Supabase instead of localStorage
  taskService.getAllTasks()
    .then(setTasks)
    .catch(console.error);
}, []);

const handleCreateTask = async (formData: TaskFormData) => {
  const newTask = await taskService.createTask({
    title: formData.title,
    // ... other fields
  });

  setTasks([...tasks, newTask]);
};
```

3. **Add real-time subscriptions:**
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('tasks')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      (payload) => {
        // Update local state based on changes
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new]);
        }
        // Handle UPDATE and DELETE
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Styling Architecture

### Tailwind CSS Approach

**Utility-first styling:**
```typescript
<button className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors">
  Create Task
</button>
```

**Benefits:**
- No separate CSS files per component
- Responsive modifiers: `sm:`, `md:`, `lg:`
- State variants: `hover:`, `focus:`, `active:`
- Consistent design tokens
- Smaller bundle size (unused styles purged)

### Custom CSS (index.css)

**Range input styling:**
```css
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

**Why custom CSS here?**
- Browser-specific pseudo-elements
- Complex styling not easily done with Tailwind
- Consistent across all range inputs

### Responsive Design

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Example usage:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
  {/* 1 col mobile, 2 cols tablet, 5 cols desktop */}
</div>
```

## Performance Considerations

### Current Optimizations

1. **React's built-in optimizations:**
   - Virtual DOM diffing
   - Batch state updates
   - Reconciliation algorithm

2. **Efficient rendering:**
   - Keys on list items
   - Conditional rendering
   - Component composition

3. **CSS transitions:**
   - GPU-accelerated properties (transform, opacity)
   - Hardware acceleration

### Potential Optimizations

**For 100+ tasks:**

1. **Memoization:**
```typescript
const sortedTasks = useMemo(
  () => sortTasks(filteredTasks, sortBy, sortOrder),
  [filteredTasks, sortBy, sortOrder]
);

const stats = useMemo(
  () => calculateTaskStats(tasks),
  [tasks]
);
```

2. **Component memoization:**
```typescript
const TaskCard = React.memo(({ task, onDelete, onToggleComplete, onUpdateProgress }) => {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.completionPercentage === nextProps.task.completionPercentage;
});
```

3. **Virtual scrolling:**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={sortedTasks.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TaskCard task={sortedTasks[index]} {...handlers} />
    </div>
  )}
</FixedSizeList>
```

4. **Debounced search:**
```typescript
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
);
```

## Error Handling

### Current Implementation

**localStorage errors:**
```typescript
try {
  const parsed = JSON.parse(savedTasks);
  setTasks(parsed);
} catch (error) {
  console.error('Error loading tasks:', error);
  // Continue with empty tasks array
}
```

**Delete confirmation:**
```typescript
if (window.confirm('Are you sure you want to delete this task?')) {
  setTasks(tasks.filter(task => task.id !== id));
}
```

### Enhanced Error Handling (Future)

```typescript
// Error boundary component
class TaskErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Task error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

// Toast notifications for user feedback
const showToast = (message: string, type: 'success' | 'error') => {
  // Implementation
};

// Usage
try {
  await taskService.createTask(newTask);
  showToast('Task created successfully', 'success');
} catch (error) {
  showToast('Failed to create task', 'error');
  console.error(error);
}
```

## Testing Strategy

### Unit Tests (Example with Jest)

```typescript
// taskUtils.test.ts
import { calculateTaskStats, sortTasks, isTaskOverdue } from './taskUtils';

describe('calculateTaskStats', () => {
  it('calculates correct completion percentage', () => {
    const tasks = [
      { isCompleted: true, status: 'completed' },
      { isCompleted: true, status: 'completed' },
      { isCompleted: false, status: 'pending' },
      { isCompleted: false, status: 'pending' },
    ];

    const stats = calculateTaskStats(tasks);

    expect(stats.totalTasks).toBe(4);
    expect(stats.completedTasks).toBe(2);
    expect(stats.completionPercentage).toBe(50);
  });

  it('handles empty task array', () => {
    const stats = calculateTaskStats([]);

    expect(stats.totalTasks).toBe(0);
    expect(stats.completionPercentage).toBe(0);
  });
});

describe('sortTasks', () => {
  it('sorts alphabetically in ascending order', () => {
    const tasks = [
      { title: 'Zebra' },
      { title: 'Apple' },
      { title: 'Banana' }
    ];

    const sorted = sortTasks(tasks, 'alphabetical', 'asc');

    expect(sorted[0].title).toBe('Apple');
    expect(sorted[2].title).toBe('Zebra');
  });
});

describe('isTaskOverdue', () => {
  it('returns true for past due date', () => {
    const task = {
      dueDate: new Date('2020-01-01'),
      isCompleted: false
    };

    expect(isTaskOverdue(task)).toBe(true);
  });

  it('returns false for completed tasks', () => {
    const task = {
      dueDate: new Date('2020-01-01'),
      isCompleted: true
    };

    expect(isTaskOverdue(task)).toBe(false);
  });
});
```

### Component Tests (Example with React Testing Library)

```typescript
// TaskCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test description',
    completionPercentage: 50,
    isCompleted: false,
    // ... other fields
  };

  const mockHandlers = {
    onDelete: jest.fn(),
    onToggleComplete: jest.fn(),
    onUpdateProgress: jest.fn()
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onToggleComplete when checkbox clicked', () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);

    const checkbox = screen.getByRole('button', { name: /complete/i });
    fireEvent.click(checkbox);

    expect(mockHandlers.onToggleComplete).toHaveBeenCalledWith('1');
  });

  it('displays overdue warning for past due tasks', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date('2020-01-01')
    };

    render(<TaskCard task={overdueTask} {...mockHandlers} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// App.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App Integration', () => {
  it('creates and displays a new task', async () => {
    render(<App />);

    // Open modal
    const addButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(addButton);

    // Fill form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Task' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    // Verify task appears
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  it('filters tasks by status', () => {
    render(<App />);

    // Create tasks with different statuses...

    // Apply filter
    const filterSelect = screen.getByRole('combobox', { name: /filter/i });
    fireEvent.change(filterSelect, { target: { value: 'completed' } });

    // Verify only completed tasks shown
    // ...
  });
});
```

## Build & Deployment

### Build Process

```bash
npm run build
```

**What happens:**
1. TypeScript compilation
2. Vite bundles all modules
3. Tailwind purges unused CSS
4. Assets are optimized
5. Output to `dist/` directory

**Output:**
```
dist/
  ├── index.html          # Entry point
  ├── assets/
  │   ├── index-[hash].js    # Bundled JavaScript
  │   └── index-[hash].css   # Bundled CSS
  └── _redirects          # For SPA routing (if needed)
```

### Deployment Options

**Static Hosting (Netlify, Vercel, GitHub Pages):**
1. Build the project
2. Upload `dist/` folder
3. Configure SPA redirects

**Netlify example (_redirects):**
```
/*  /index.html  200
```

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment Variables

**For Supabase integration:**

`.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Access in code:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

## Code Quality Tools

### TypeScript Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Strict mode benefits:**
- Catches potential null/undefined errors
- Enforces proper typing
- Better IDE support

### ESLint

**Configured for:**
- React best practices
- Hook rules
- TypeScript integration

**Run linter:**
```bash
npm run lint
```

### Prettier (Optional)

**Add for consistent formatting:**

```bash
npm install -D prettier
```

**.prettierrc:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## Development Workflow

### Recommended Flow

1. **Start dev server:**
```bash
npm run dev
```

2. **Make changes** in your editor

3. **Check types:**
```bash
npm run typecheck
```

4. **Lint code:**
```bash
npm run lint
```

5. **Test build:**
```bash
npm run build
```

6. **Preview build:**
```bash
npm run preview
```

### Hot Module Replacement (HMR)

Vite provides instant feedback:
- Changes reflect immediately
- State is preserved when possible
- Fast refresh for React components

## Security Considerations

### Input Sanitization

**Already handled by React:**
- Automatic escaping in JSX
- No dangerouslySetInnerHTML used
- Form inputs are controlled

### XSS Prevention

**Safe practices:**
```typescript
// ✅ Safe - React escapes automatically
<div>{task.title}</div>

// ❌ Unsafe - Avoid this
<div dangerouslySetInnerHTML={{ __html: task.title }} />
```

### LocalStorage Security

**Considerations:**
- Data is not encrypted
- Accessible to JavaScript on same domain
- Not suitable for sensitive information
- Users should not store passwords/tokens in task descriptions

**For production with sensitive data:**
- Use Supabase with Row Level Security
- Implement user authentication
- Store data server-side

## Accessibility (a11y)

### Current Implementation

**Semantic HTML:**
```typescript
<button onClick={...}>Delete</button>  // Not <div onClick={...}>
```

**ARIA labels:**
```typescript
<button title="Delete task" aria-label="Delete task">
  <Trash2 />
</button>
```

**Keyboard navigation:**
- Tab through interactive elements
- Enter to submit forms
- Esc to close modals

### Improvements for WCAG AA Compliance

```typescript
// Add skip link
<a href="#main-content" className="sr-only">Skip to main content</a>

// Add live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Improve focus management
useEffect(() => {
  if (isModalOpen) {
    modalRef.current?.focus();
  }
}, [isModalOpen]);

// Add keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills Needed for Older Browsers

```typescript
// For ES2020 features
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

### Feature Detection

```typescript
// Check localStorage availability
const isLocalStorageAvailable = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
```

## Troubleshooting Common Issues

### Build Errors

**Issue:** TypeScript errors during build
**Solution:** Run `npm run typecheck` to see details

**Issue:** Module not found
**Solution:** Check imports and run `npm install`

### Runtime Errors

**Issue:** Tasks not persisting
**Solution:** Check localStorage quota (5-10MB limit)

**Issue:** Dates showing as strings
**Solution:** Ensure Date conversion in localStorage load

### Performance Issues

**Issue:** Slow with many tasks
**Solution:** Implement memoization and virtual scrolling

**Issue:** Layout shift on load
**Solution:** Add skeleton loaders

## Future Enhancements

### Planned Features

1. **Drag-and-drop reordering**
2. **Task templates**
3. **Recurring tasks**
4. **Subtasks/checklists**
5. **File attachments**
6. **Calendar view**
7. **Time tracking**
8. **Team collaboration**
9. **Mobile app (React Native)**
10. **Browser extension**

### Architecture for Scaling

When adding auth and multi-user support:

```
Frontend (React)
  ↓
API Layer (Supabase)
  ↓
Database (PostgreSQL)
  ↓
Storage (Supabase Storage for files)
```

**Additional services:**
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Edge Functions**: For complex operations
- **Cron Jobs**: For reminders/notifications

---

**This technical guide provides the foundation for maintaining and extending the Task Manager application.**
