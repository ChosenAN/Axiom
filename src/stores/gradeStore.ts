import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKey } from '../lib/storage'
import type { Assignment, Course } from '../types/grades'

interface GradeState {
  courses: Course[]
  assignments: Assignment[]
  addCourse: (course: Omit<Course, 'id'>) => string
  updateCourse: (id: string, patch: Partial<Omit<Course, 'id'>>) => void
  deleteCourse: (id: string) => void
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void
  updateAssignment: (
    id: string,
    patch: Partial<Omit<Assignment, 'id' | 'courseId'>>,
  ) => void
  deleteAssignment: (id: string) => void
}

export const useGradeStore = create<GradeState>()(
  persist(
    (set) => ({
      courses: [],
      assignments: [],

      addCourse: (course) => {
        const id = crypto.randomUUID()
        set((s) => ({ courses: [...s.courses, { ...course, id }] }))
        return id
      },

      updateCourse: (id, patch) =>
        set((s) => {
          const courses = s.courses.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          )
          const updated = courses.find((c) => c.id === id)
          if (!updated) return { courses }
          // Prune assignments orphaned by category removal.
          const validCategoryIds = new Set(
            updated.categories.map((cat) => cat.id),
          )
          const assignments = s.assignments.filter(
            (a) =>
              a.courseId !== id ||
              a.categoryId === null ||
              validCategoryIds.has(a.categoryId),
          )
          return { courses, assignments }
        }),

      deleteCourse: (id) =>
        set((s) => ({
          courses: s.courses.filter((c) => c.id !== id),
          assignments: s.assignments.filter((a) => a.courseId !== id),
        })),

      addAssignment: (assignment) =>
        set((s) => ({
          assignments: [
            ...s.assignments,
            { ...assignment, id: crypto.randomUUID() },
          ],
        })),

      updateAssignment: (id, patch) =>
        set((s) => ({
          assignments: s.assignments.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        })),

      deleteAssignment: (id) =>
        set((s) => ({
          assignments: s.assignments.filter((a) => a.id !== id),
        })),
    }),
    { name: storageKey('grades') },
  ),
)
