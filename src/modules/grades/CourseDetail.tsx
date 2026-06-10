import { useState, type FormEvent } from 'react'
import { ArrowLeft, FlaskConical, Pencil, Trash2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { categoryPercent, courseGrade, letterGrade } from '../../lib/gradeCalc'
import { useGradeStore } from '../../stores/gradeStore'
import type { Assignment, Course } from '../../types/grades'
import { CourseForm } from './CourseForm'
import { WhatIfPanel } from './WhatIfPanel'

const inputClass =
  'rounded border border-white/10 bg-bg px-2 py-1 text-sm text-white outline-none focus:border-accent'

function parseScore(value: string): number | null {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : null
}

export function CourseDetail({
  course,
  onBack,
}: {
  course: Course
  onBack: () => void
}) {
  const assignments = useGradeStore((s) => s.assignments)
  const deleteCourse = useGradeStore((s) => s.deleteCourse)
  const [editing, setEditing] = useState(false)
  const [showWhatIf, setShowWhatIf] = useState(false)

  if (editing) {
    return <CourseForm course={course} onClose={() => setEditing(false)} />
  }

  const courseAssignments = assignments.filter((a) => a.courseId === course.id)
  const grade = courseGrade(course, assignments)

  const sections =
    course.gradingMode === 'weighted'
      ? course.categories.map((cat) => ({
          key: cat.id,
          categoryId: cat.id as string | null,
          title: cat.name,
          subtitle: `${cat.weight}% of grade${
            cat.dropLowest > 0 ? ` · drops ${cat.dropLowest} lowest` : ''
          }`,
          pct: categoryPercent(
            courseAssignments.filter((a) => a.categoryId === cat.id),
            cat.dropLowest,
          ),
        }))
      : [
          {
            key: 'all',
            categoryId: null as string | null,
            title: 'Assignments',
            subtitle: 'Points-based',
            pct: grade,
          },
        ]

  const chartData = sections
    .filter((s) => s.pct !== null)
    .map((s) => ({ name: s.title, pct: s.pct as number }))

  return (
    <div className="max-w-4xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft size={15} />
        All courses
      </button>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{course.name}</h2>
          <p className="text-sm text-gray-500">
            {course.term} · {course.units} units ·{' '}
            {course.gradingMode === 'weighted'
              ? 'weighted categories'
              : 'points-based'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            {grade === null ? (
              <span className="text-sm text-gray-500">No grades yet</span>
            ) : (
              <>
                <span className="grade-num block text-3xl font-bold text-white">
                  {grade.toFixed(2)}%
                </span>
                <span className="font-medium text-secondary">
                  {letterGrade(grade)}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setShowWhatIf((v) => !v)}
              title="What-if simulator"
              className={`rounded-lg p-2 ${
                showWhatIf
                  ? 'bg-secondary/15 text-secondary'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <FlaskConical size={17} />
            </button>
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Edit course"
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5"
            >
              <Pencil size={17} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete ${course.name} and all its assignments?`,
                  )
                ) {
                  deleteCourse(course.id)
                  onBack()
                }
              }}
              title="Delete course"
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-red-400"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </div>

      {showWhatIf && (
        <WhatIfPanel course={course} assignments={courseAssignments} />
      )}

      {course.gradingMode === 'weighted' && chartData.length > 0 && (
        <div className="mb-6 rounded-xl bg-surface p-5">
          <h3 className="mb-3 text-sm font-medium text-gray-400">
            Category breakdown
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  formatter={(value) => [
                    `${(value as number).toFixed(1)}%`,
                    'Score',
                  ]}
                  contentStyle={{
                    backgroundColor: '#1a1d27',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#e5e7eb',
                  }}
                />
                <Bar
                  dataKey="pct"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <div key={section.key} className="rounded-xl bg-surface p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <h3 className="font-medium text-white">{section.title}</h3>
                <p className="text-xs text-gray-500">{section.subtitle}</p>
              </div>
              {section.pct !== null && (
                <span className="grade-num text-sm font-medium text-gray-300">
                  {section.pct.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {courseAssignments
                .filter((a) => a.categoryId === section.categoryId)
                .map((a) => (
                  <AssignmentRow key={a.id} assignment={a} />
                ))}
              <AddAssignmentRow
                courseId={course.id}
                categoryId={section.categoryId}
              />
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-sm text-gray-500">
            This course has no categories. Edit the course to add some.
          </p>
        )}
      </div>
    </div>
  )
}

function AssignmentRow({ assignment }: { assignment: Assignment }) {
  const updateAssignment = useGradeStore((s) => s.updateAssignment)
  const deleteAssignment = useGradeStore((s) => s.deleteAssignment)

  return (
    <div className="flex items-center gap-2">
      <input
        value={assignment.name}
        onChange={(e) =>
          updateAssignment(assignment.id, { name: e.target.value })
        }
        className={`${inputClass} flex-1`}
      />
      <input
        value={assignment.earned === null ? '' : String(assignment.earned)}
        onChange={(e) =>
          updateAssignment(assignment.id, {
            earned: parseScore(e.target.value),
          })
        }
        placeholder="—"
        inputMode="decimal"
        className={`${inputClass} grade-num w-20 text-right`}
      />
      <span className="text-gray-600">/</span>
      <input
        value={String(assignment.total)}
        onChange={(e) =>
          updateAssignment(assignment.id, {
            total: parseScore(e.target.value) ?? 0,
          })
        }
        inputMode="decimal"
        className={`${inputClass} grade-num w-20 text-right`}
      />
      <span className="grade-num w-14 text-right text-xs text-gray-500">
        {assignment.earned !== null && assignment.total > 0
          ? `${((assignment.earned / assignment.total) * 100).toFixed(1)}%`
          : ''}
      </span>
      <button
        type="button"
        onClick={() => deleteAssignment(assignment.id)}
        className="p-1 text-gray-600 hover:text-red-400"
        aria-label={`Delete ${assignment.name}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function AddAssignmentRow({
  courseId,
  categoryId,
}: {
  courseId: string
  categoryId: string | null
}) {
  const addAssignment = useGradeStore((s) => s.addAssignment)
  const [name, setName] = useState('')
  const [earned, setEarned] = useState('')
  const [total, setTotal] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addAssignment({
      courseId,
      categoryId,
      name: name.trim(),
      earned: parseScore(earned),
      total: parseScore(total) ?? 100,
    })
    setName('')
    setEarned('')
    setTotal('')
  }

  return (
    <form onSubmit={submit} className="mt-1 flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add assignment…"
        className={`${inputClass} flex-1`}
      />
      <input
        value={earned}
        onChange={(e) => setEarned(e.target.value)}
        placeholder="earned"
        inputMode="decimal"
        className={`${inputClass} grade-num w-20 text-right`}
      />
      <span className="text-gray-600">/</span>
      <input
        value={total}
        onChange={(e) => setTotal(e.target.value)}
        placeholder="100"
        inputMode="decimal"
        className={`${inputClass} grade-num w-20 text-right`}
      />
      <button
        type="submit"
        className="rounded bg-white/5 px-3 py-1 text-sm text-gray-300 hover:bg-white/10"
      >
        Add
      </button>
    </form>
  )
}
