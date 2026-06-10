import { useState } from 'react'
import { courseGrade, letterGrade, requiredScore } from '../../lib/gradeCalc'
import type { Assignment, Course } from '../../types/grades'

const inputClass =
  'rounded border border-white/10 bg-bg px-2 py-1 text-sm text-white outline-none focus:border-secondary'

export function WhatIfPanel({
  course,
  assignments,
}: {
  course: Course
  assignments: Assignment[]
}) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [targetId, setTargetId] = useState('')
  const [targetPct, setTargetPct] = useState('90')

  const ungraded = assignments.filter((a) => a.earned === null && a.total > 0)

  const overrides: Record<string, number> = {}
  for (const [id, value] of Object.entries(inputs)) {
    const n = parseFloat(value)
    if (Number.isFinite(n)) overrides[id] = n
  }

  const actual = courseGrade(course, assignments)
  const projected = courseGrade(course, assignments, overrides)
  const hasOverrides = Object.keys(overrides).length > 0

  const target = ungraded.find((a) => a.id === targetId)
  const needed = target
    ? requiredScore(
        course,
        assignments,
        target.id,
        parseFloat(targetPct) || 0,
        overrides,
      )
    : null

  return (
    <div className="mb-6 rounded-xl border border-secondary/30 bg-surface p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-medium text-secondary">What-if simulator</h3>
        <div className="grade-num text-sm text-gray-400">
          {actual !== null && <span>Actual {actual.toFixed(2)}%</span>}
          {hasOverrides && projected !== null && (
            <span className="ml-3 font-semibold text-secondary">
              Projected {projected.toFixed(2)}% ({letterGrade(projected)})
            </span>
          )}
        </div>
      </div>

      {ungraded.length === 0 ? (
        <p className="text-sm text-gray-500">
          Everything is graded. Add an ungraded assignment (leave its score
          blank) to simulate outcomes.
        </p>
      ) : (
        <>
          <p className="mb-2 text-xs text-gray-500">
            Enter hypothetical scores — your real grades are never changed.
          </p>
          <div className="flex flex-col gap-1.5">
            {ungraded.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 text-gray-300">{a.name}</span>
                <input
                  value={inputs[a.id] ?? ''}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [a.id]: e.target.value }))
                  }
                  placeholder="score"
                  inputMode="decimal"
                  className={`${inputClass} grade-num w-20 text-right`}
                />
                <span className="grade-num w-12 text-xs text-gray-500">
                  / {a.total}
                </span>
              </label>
            ))}
          </div>
          {hasOverrides && (
            <button
              type="button"
              onClick={() => setInputs({})}
              className="mt-2 text-xs text-gray-400 hover:text-white"
            >
              Clear simulation
            </button>
          )}

          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
              <span>I need</span>
              <input
                value={targetPct}
                onChange={(e) => setTargetPct(e.target.value)}
                inputMode="decimal"
                className={`${inputClass} grade-num w-16 text-right`}
              />
              <span>% overall — what do I need on</span>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className={inputClass}
              >
                <option value="">choose assignment…</option>
                {ungraded.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <span>?</span>
            </div>
            {target && needed !== null && (
              <p className="grade-num mt-2 text-sm">
                {needed <= target.total ? (
                  <span className="text-secondary">
                    You need {needed.toFixed(1)} / {target.total} (
                    {((needed / target.total) * 100).toFixed(1)}%).
                  </span>
                ) : (
                  <span className="text-amber-400">
                    Not reachable — it would take {needed.toFixed(1)} /{' '}
                    {target.total} (
                    {((needed / target.total) * 100).toFixed(1)}%).
                  </span>
                )}
              </p>
            )}
            {target && needed === null && (
              <p className="mt-2 text-sm text-gray-500">
                This assignment can't change the grade enough to compute a
                requirement.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
