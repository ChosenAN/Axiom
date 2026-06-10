import { useState } from 'react'
import { Columns3, List, Plus } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import type { Task } from '../../types/tasks'
import { KanbanView } from './KanbanView'
import { ListView } from './ListView'
import { TaskForm } from './TaskForm'

type ViewMode = 'kanban' | 'list'

export function TaskTracker() {
  const tasks = useTaskStore((s) => s.tasks)
  const [view, setView] = useState<ViewMode>('kanban')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  function openEdit(task: Task) {
    setEditing(task)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Task Tracker</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-white/5 p-0.5">
            {(
              [
                { mode: 'kanban', icon: Columns3, label: 'Kanban view' },
                { mode: 'list', icon: List, label: 'List view' },
              ] as const
            ).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                title={label}
                className={`rounded-md px-2.5 py-1.5 ${
                  view === mode
                    ? 'bg-surface text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/85"
          >
            <Plus size={16} />
            Add task
          </button>
        </div>
      </div>

      {showForm && <TaskForm task={editing ?? undefined} onClose={closeForm} />}

      {tasks.length === 0 && !showForm ? (
        <p className="text-gray-500">
          No tasks yet. Add assignments and exams to stay on top of deadlines.
        </p>
      ) : view === 'kanban' ? (
        <KanbanView tasks={tasks} onEdit={openEdit} />
      ) : (
        <ListView tasks={tasks} onEdit={openEdit} />
      )}
    </div>
  )
}
