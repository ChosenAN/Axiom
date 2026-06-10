import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { courseGrade, letterGrade } from '../../lib/gradeCalc'
import { useGradeStore } from '../../stores/gradeStore'
import type { Assignment, Course } from '../../types/grades'
import { CourseDetail } from './CourseDetail'
import { CourseForm } from './CourseForm'

type View =
  | { kind: 'list' }
  | { kind: 'new' }
  | { kind: 'detail'; courseId: string }

export function GradeTracker() {
  const courses = useGradeStore((s) => s.courses)
  const assignments = useGradeStore((s) => s.assignments)
  const [view, setView] = useState<View>({ kind: 'list' })

  if (view.kind === 'new') {
    return (
      <CourseForm
        onClose={(id) =>
          setView(id ? { kind: 'detail', courseId: id } : { kind: 'list' })
        }
      />
    )
  }

  if (view.kind === 'detail') {
    const course = courses.find((c) => c.id === view.courseId)
    if (course) {
      return (
        <CourseDetail
          course={course}
          onBack={() => setView({ kind: 'list' })}
        />
      )
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Grade Tracker</h2>
        <button
          type="button"
          onClick={() => setView({ kind: 'new' })}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/85"
        >
          <Plus size={16} />
          Add course
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-500">
          No courses yet. Add your first course to start tracking grades.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              assignments={assignments}
              onOpen={() => setView({ kind: 'detail', courseId: course.id })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({
  course,
  assignments,
  onOpen,
}: {
  course: Course
  assignments: Assignment[]
  onOpen: () => void
}) {
  const grade = courseGrade(course, assignments)
  const trend = assignments
    .filter((a) => a.courseId === course.id && a.earned !== null && a.total > 0)
    .map((a, i) => ({ i, pct: ((a.earned as number) / a.total) * 100 }))

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-xl bg-surface p-5 text-left transition-colors hover:bg-surface/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">{course.name}</h3>
          <p className="text-xs text-gray-500">
            {course.term} · {course.units} units
          </p>
        </div>
        <div className="text-right">
          {grade === null ? (
            <span className="text-sm text-gray-500">No grades</span>
          ) : (
            <>
              <span className="grade-num block text-xl font-semibold text-white">
                {grade.toFixed(1)}%
              </span>
              <span className="text-sm font-medium text-secondary">
                {letterGrade(grade)}
              </span>
            </>
          )}
        </div>
      </div>
      {trend.length > 1 && (
        <div className="mt-4 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <Line
                type="monotone"
                dataKey="pct"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </button>
  )
}
