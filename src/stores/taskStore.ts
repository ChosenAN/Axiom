import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKey } from '../lib/storage'
import type { Task } from '../types/tasks'

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void
  deleteTask: (id: string) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (task) =>
        set((s) => ({
          tasks: [...s.tasks, { ...task, id: crypto.randomUUID() }],
        })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        })),
    }),
    { name: storageKey('tasks') },
  ),
)
