export type TaskType = 'assignment' | 'exam' | 'other'

export type TaskStatus = 'todo' | 'doing' | 'done'

export interface Task {
  id: string
  title: string
  type: TaskType
  /** Optional link to a Grade Tracker course. */
  courseId: string | null
  /** ISO date (YYYY-MM-DD), null = no deadline. */
  dueDate: string | null
  status: TaskStatus
  notes: string
}
