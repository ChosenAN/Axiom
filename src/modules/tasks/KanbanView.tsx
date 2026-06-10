import { useState } from 'react'
import { compareDueDates } from '../../lib/taskDates'
import { useTaskStore } from '../../stores/taskStore'
import type { Task, TaskStatus } from '../../types/tasks'
import { TaskCard } from './TaskCard'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To do' },
  { status: 'doing', label: 'In progress' },
  { status: 'done', label: 'Done' },
]

export function KanbanView({
  tasks,
  onEdit,
}: {
  tasks: Task[]
  onEdit: (task: Task) => void
}) {
  const updateTask = useTaskStore((s) => s.updateTask)
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {COLUMNS.map(({ status, label }) => {
        const columnTasks = tasks
          .filter((t) => t.status === status)
          .sort((a, b) => compareDueDates(a.dueDate, b.dueDate))
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(status)
            }}
            onDragLeave={() =>
              setDragOver((d) => (d === status ? null : d))
            }
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/plain')
              if (id) updateTask(id, { status })
              setDragOver(null)
            }}
            className={`rounded-xl border p-3 ${
              dragOver === status
                ? 'border-accent/60 bg-accent/5'
                : 'border-white/5 bg-white/[0.02]'
            }`}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-gray-300">{label}</h3>
              <span className="grade-num text-xs text-gray-500">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex min-h-16 flex-col gap-2">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => onEdit(task)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
