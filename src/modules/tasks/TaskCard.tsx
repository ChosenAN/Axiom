import { Pencil, Trash2 } from 'lucide-react'
import { dueBucket, formatDueDate, type DueBucket } from '../../lib/taskDates'
import { useGradeStore } from '../../stores/gradeStore'
import { useTaskStore } from '../../stores/taskStore'
import type { Task, TaskType } from '../../types/tasks'

const TYPE_STYLES: Record<TaskType, string> = {
  assignment: 'bg-accent/10 text-accent',
  exam: 'bg-red-500/10 text-red-300',
  other: 'bg-white/5 text-gray-400',
}

export function TypeBadge({ type }: { type: TaskType }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_STYLES[type]}`}
    >
      {type}
    </span>
  )
}

const BUCKET_STYLES: Record<DueBucket, string> = {
  overdue: 'text-red-400',
  today: 'text-amber-400',
  week: 'text-secondary',
  later: 'text-gray-500',
  none: 'text-gray-500',
}

export function DueChip({ task }: { task: Task }) {
  if (!task.dueDate) return null
  const bucket = task.status === 'done' ? 'none' : dueBucket(task.dueDate)
  return (
    <span className={`grade-num text-[11px] ${BUCKET_STYLES[bucket]}`}>
      {bucket === 'overdue' && 'overdue · '}
      {formatDueDate(task.dueDate)}
    </span>
  )
}

export function CourseTag({ courseId }: { courseId: string | null }) {
  const courses = useGradeStore((s) => s.courses)
  const name = courseId
    ? courses.find((c) => c.id === courseId)?.name
    : undefined
  if (!name) return null
  return <span className="text-[11px] text-gray-500">{name}</span>
}

export function TaskCard({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const deleteTask = useTaskStore((s) => s.deleteTask)

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
      className="group cursor-grab rounded-lg bg-surface p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-200">{task.title}</p>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
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
      {task.notes && <p className="mt-1 text-xs text-gray-500">{task.notes}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <TypeBadge type={task.type} />
        <CourseTag courseId={task.courseId} />
        <DueChip task={task} />
      </div>
    </div>
  )
}
