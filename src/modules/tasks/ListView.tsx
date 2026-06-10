import { Pencil, Trash2 } from 'lucide-react'
import {
  compareDueDates,
  dueBucket,
  type DueBucket,
} from '../../lib/taskDates'
import { useTaskStore } from '../../stores/taskStore'
import type { Task } from '../../types/tasks'
import { CourseTag, DueChip, TypeBadge } from './TaskCard'

type GroupKey = DueBucket | 'done'

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'later', label: 'Later' },
  { key: 'none', label: 'No deadline' },
  { key: 'done', label: 'Done' },
]

export function ListView({
  tasks,
  onEdit,
}: {
  tasks: Task[]
  onEdit: (task: Task) => void
}) {
  const updateTask = useTaskStore((s) => s.updateTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)

  const grouped = new Map<GroupKey, Task[]>()
  for (const task of tasks) {
    const key: GroupKey =
      task.status === 'done' ? 'done' : dueBucket(task.dueDate)
    const group = grouped.get(key)
    if (group) group.push(task)
    else grouped.set(key, [task])
  }

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {GROUPS.map(({ key, label }) => {
        const group = (grouped.get(key) ?? []).sort((a, b) =>
          compareDueDates(a.dueDate, b.dueDate),
        )
        if (group.length === 0) return null
        return (
          <div key={key}>
            <h3
              className={`mb-2 text-xs font-medium tracking-wide uppercase ${
                key === 'overdue' ? 'text-red-400' : 'text-gray-500'
              }`}
            >
              {label}
            </h3>
            <div className="flex flex-col gap-1">
              {group.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-lg bg-surface px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={(e) =>
                      updateTask(task.id, {
                        status: e.target.checked ? 'done' : 'todo',
                      })
                    }
                    className="size-4 accent-(--color-accent)"
                    aria-label={`Mark ${task.title} ${
                      task.status === 'done' ? 'not done' : 'done'
                    }`}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      task.status === 'done'
                        ? 'text-gray-500 line-through'
                        : 'text-gray-200'
                    }`}
                  >
                    {task.title}
                  </span>
                  <TypeBadge type={task.type} />
                  <CourseTag courseId={task.courseId} />
                  <DueChip task={task} />
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="text-gray-500 hover:text-white"
                      aria-label={`Edit ${task.title}`}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-500 hover:text-red-400"
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
