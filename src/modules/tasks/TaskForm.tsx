import { useState, type FormEvent } from 'react'
import { useGradeStore } from '../../stores/gradeStore'
import { useTaskStore } from '../../stores/taskStore'
import type { Task, TaskType } from '../../types/tasks'

const inputClass =
  'rounded-lg border border-white/10 bg-bg px-3 py-2 text-sm text-white outline-none focus:border-accent'

export function TaskForm({
  task,
  onClose,
}: {
  task?: Task
  onClose: () => void
}) {
  const addTask = useTaskStore((s) => s.addTask)
  const updateTask = useTaskStore((s) => s.updateTask)
  const courses = useGradeStore((s) => s.courses)

  const [title, setTitle] = useState(task?.title ?? '')
  const [type, setType] = useState<TaskType>(task?.type ?? 'assignment')
  const [courseId, setCourseId] = useState(task?.courseId ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Task title is required.')
      return
    }
    const data = {
      title: title.trim(),
      type,
      courseId: courseId || null,
      dueDate: dueDate || null,
      notes: notes.trim(),
    }
    if (task) {
      updateTask(task.id, data)
    } else {
      addTask({ ...data, status: 'todo' })
    }
    onClose()
  }

  return (
    <form onSubmit={submit} className="mb-6 rounded-xl bg-surface p-5">
      <h3 className="mb-4 font-medium text-white">
        {task ? 'Edit task' : 'New task'}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs text-gray-400 sm:col-span-2">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="PS3, Midterm 1, …"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
            className={inputClass}
          >
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400 sm:col-span-2">
          Course (optional)
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={inputClass}
          >
            <option value="">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400 sm:col-span-2">
          Notes (optional)
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Chapters 4–6, bring calculator…"
            className={inputClass}
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/85"
        >
          {task ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  )
}
