import { ChevronRight } from 'lucide-react'
import { courseGrade, letterGrade } from '../../lib/gradeCalc'
import {
  compareDueDates,
  dueBucket,
  formatDueDate,
  type DueBucket,
} from '../../lib/taskDates'
import { useGradeStore } from '../../stores/gradeStore'
import { useNavStore, type ModuleId } from '../../stores/navStore'
import { useOpportunityStore } from '../../stores/opportunityStore'
import { useTaskStore } from '../../stores/taskStore'
import type { OpportunityStatus } from '../../types/opportunities'

const BUCKET_STYLES: Record<DueBucket, string> = {
  overdue: 'text-red-400',
  today: 'text-amber-400',
  week: 'text-secondary',
  later: 'text-gray-500',
  none: 'text-gray-500',
}

/** Deadlines stop mattering once a decision is in. */
const CLOSED_STATUSES: OpportunityStatus[] = [
  'accepted',
  'waitlisted',
  'rejected',
]

export function Dashboard() {
  const courses = useGradeStore((s) => s.courses)
  const assignments = useGradeStore((s) => s.assignments)
  const tasks = useTaskStore((s) => s.tasks)
  const opportunities = useOpportunityStore((s) => s.opportunities)

  const grades = courses.map((course) => ({
    course,
    grade: courseGrade(course, assignments),
  }))
  let weightedSum = 0
  let unitTotal = 0
  for (const { course, grade } of grades) {
    if (grade === null || course.units <= 0) continue
    weightedSum += grade * course.units
    unitTotal += course.units
  }
  const overall = unitTotal > 0 ? weightedSum / unitTotal : null

  const openTasks = tasks.filter((t) => t.status !== 'done')
  const upcoming = [...openTasks]
    .sort((a, b) => compareDueDates(a.dueDate, b.dueDate))
    .slice(0, 5)
  const overdueCount = openTasks.filter(
    (t) => dueBucket(t.dueDate) === 'overdue',
  ).length
  const todayCount = openTasks.filter(
    (t) => dueBucket(t.dueDate) === 'today',
  ).length

  const openOpportunities = opportunities.filter(
    (o) => !CLOSED_STATUSES.includes(o.status),
  )
  const deadlines = openOpportunities
    .filter((o) => o.deadline !== null)
    .sort((a, b) => compareDueDates(a.deadline, b.deadline))
    .slice(0, 5)

  return (
    <div className="max-w-4xl">
      <h2 className="mb-6 text-2xl font-semibold text-white">Dashboard</h2>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <Stat label="Active courses" value={courses.length} />
        <Stat label="Open tasks" value={openTasks.length} />
        <Stat label="Active applications" value={openOpportunities.length} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-surface p-5">
          <CardHeader title="Grades" module="grades" />
          {grades.length === 0 ? (
            <Empty text="No courses yet. Add them in the Grade Tracker." />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {grades.map(({ course, grade }) => (
                  <div
                    key={course.id}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="truncate text-sm text-gray-300">
                      {course.name}
                    </span>
                    {grade === null ? (
                      <span className="text-xs text-gray-500">no grades</span>
                    ) : (
                      <span className="grade-num shrink-0 text-sm text-white">
                        {grade.toFixed(1)}%{' '}
                        <span className="text-gray-400">
                          {letterGrade(grade)}
                        </span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {overall !== null && (
                <p className="mt-3 border-t border-white/5 pt-3 text-sm text-gray-400">
                  Overall (graded courses, unit-weighted):{' '}
                  <span className="grade-num text-white">
                    {overall.toFixed(1)}% {letterGrade(overall)}
                  </span>
                </p>
              )}
            </>
          )}
        </section>

        <section className="rounded-xl bg-surface p-5">
          <CardHeader title="Upcoming tasks" module="tasks" />
          {(overdueCount > 0 || todayCount > 0) && (
            <p className="mb-2 text-xs">
              {overdueCount > 0 && (
                <span className="text-red-400">{overdueCount} overdue</span>
              )}
              {overdueCount > 0 && todayCount > 0 && (
                <span className="text-gray-500"> · </span>
              )}
              {todayCount > 0 && (
                <span className="text-amber-400">{todayCount} due today</span>
              )}
            </p>
          )}
          {upcoming.length === 0 ? (
            <Empty text="No open tasks. Add them in the Task Tracker." />
          ) : (
            <div className="flex flex-col gap-2">
              {upcoming.map((t) => (
                <div
                  key={t.id}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="truncate text-sm text-gray-300">
                    {t.title}
                  </span>
                  {t.dueDate && (
                    <span
                      className={`grade-num shrink-0 text-xs ${BUCKET_STYLES[dueBucket(t.dueDate)]}`}
                    >
                      {formatDueDate(t.dueDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl bg-surface p-5 lg:col-span-2">
          <CardHeader title="Application deadlines" module="opportunities" />
          {deadlines.length === 0 ? (
            <Empty text="No open application deadlines. Track programs and scholarships in Opportunities." />
          ) : (
            <div className="flex flex-col gap-2">
              {deadlines.map((o) => (
                <div
                  key={o.id}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="truncate text-sm text-gray-300">
                    {o.name}
                    {o.organization && (
                      <span className="text-gray-500"> · {o.organization}</span>
                    )}
                  </span>
                  <span
                    className={`grade-num shrink-0 text-xs ${BUCKET_STYLES[dueBucket(o.deadline)]}`}
                  >
                    {formatDueDate(o.deadline!)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function CardHeader({ title, module }: { title: string; module: ModuleId }) {
  const setActive = useNavStore((s) => s.setActive)
  return (
    <button
      type="button"
      onClick={() => setActive(module)}
      className="mb-3 flex w-full items-center justify-between text-left"
      aria-label={`Go to ${title}`}
    >
      <h3 className="font-medium text-white">{title}</h3>
      <ChevronRight size={16} className="text-gray-500" />
    </button>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface p-4">
      <p className="grade-num text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-gray-500">{text}</p>
}
