import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { useGradeStore } from '../../stores/gradeStore'
import type { Category, Course, GradingMode } from '../../types/grades'

interface CategoryRow {
  id: string
  name: string
  weight: string
  dropLowest: string
}

const inputClass =
  'rounded-lg border border-white/10 bg-bg px-3 py-2 text-sm text-white outline-none focus:border-accent'

export function CourseForm({
  course,
  onClose,
}: {
  course?: Course
  onClose: (courseId: string | null) => void
}) {
  const addCourse = useGradeStore((s) => s.addCourse)
  const updateCourse = useGradeStore((s) => s.updateCourse)

  const [name, setName] = useState(course?.name ?? '')
  const [term, setTerm] = useState(course?.term ?? '')
  const [units, setUnits] = useState(String(course?.units ?? 4))
  const [mode, setMode] = useState<GradingMode>(
    course?.gradingMode ?? 'weighted',
  )
  const [categories, setCategories] = useState<CategoryRow[]>(
    course && course.categories.length > 0
      ? course.categories.map((c) => ({
          id: c.id,
          name: c.name,
          weight: String(c.weight),
          dropLowest: String(c.dropLowest),
        }))
      : [{ id: crypto.randomUUID(), name: '', weight: '', dropLowest: '0' }],
  )
  const [error, setError] = useState<string | null>(null)

  const weightSum = categories.reduce(
    (sum, c) => sum + (parseFloat(c.weight) || 0),
    0,
  )

  function setRow(id: string, patch: Partial<CategoryRow>) {
    setCategories((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    )
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Course name is required.')
      return
    }
    let parsed: Category[] = []
    if (mode === 'weighted') {
      parsed = categories
        .filter((c) => c.name.trim())
        .map((c) => ({
          id: c.id,
          name: c.name.trim(),
          weight: parseFloat(c.weight) || 0,
          dropLowest: Math.max(0, Math.floor(parseFloat(c.dropLowest) || 0)),
        }))
      if (parsed.length === 0) {
        setError('Weighted courses need at least one named category.')
        return
      }
      if (parsed.some((c) => c.weight <= 0)) {
        setError('Every category needs a weight greater than 0.')
        return
      }
    }
    const data = {
      name: name.trim(),
      term: term.trim(),
      units: parseFloat(units) || 0,
      gradingMode: mode,
      categories: parsed,
    }
    if (course) {
      updateCourse(course.id, data)
      onClose(course.id)
    } else {
      onClose(addCourse(data))
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-semibold text-white">
        {course ? 'Edit course' : 'New course'}
      </h2>

      <div className="rounded-xl bg-surface p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Course name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="BILD 1"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Term
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="FA26"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Units
            <input
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              inputMode="decimal"
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          {(['weighted', 'points'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                mode === m
                  ? 'bg-accent text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {m === 'weighted' ? 'Weighted categories' : 'Points-based'}
            </button>
          ))}
        </div>

        {mode === 'weighted' && (
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs text-gray-400">Categories</span>
              <span
                className={`grade-num text-xs ${
                  Math.abs(weightSum - 100) < 0.01
                    ? 'text-gray-500'
                    : 'text-amber-400'
                }`}
              >
                Weights sum to {weightSum}%
                {Math.abs(weightSum - 100) >= 0.01 && ' (renormalized)'}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {categories.map((row) => (
                <div key={row.id} className="flex items-center gap-2">
                  <input
                    value={row.name}
                    onChange={(e) => setRow(row.id, { name: e.target.value })}
                    placeholder="Category (e.g. Exams)"
                    className={`${inputClass} flex-1`}
                  />
                  <div className="flex items-stretch">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-white/10 bg-white/5 px-2 text-xs text-gray-400">
                      Weight %
                    </span>
                    <input
                      value={row.weight}
                      onChange={(e) =>
                        setRow(row.id, { weight: e.target.value })
                      }
                      placeholder="30"
                      inputMode="decimal"
                      className="w-16 rounded-r-lg border border-white/10 bg-bg px-2 py-2 text-sm text-white outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex items-stretch">
                    <span
                      className="inline-flex items-center rounded-l-lg border border-r-0 border-white/10 bg-white/5 px-2 text-xs text-gray-400"
                      title="How many of this category's lowest scores are dropped (0 = none)"
                    >
                      Drop lowest
                    </span>
                    <input
                      value={row.dropLowest}
                      onChange={(e) =>
                        setRow(row.id, { dropLowest: e.target.value })
                      }
                      title="How many of this category's lowest scores are dropped (0 = none)"
                      inputMode="numeric"
                      className="w-12 rounded-r-lg border border-white/10 bg-bg px-2 py-2 text-sm text-white outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCategories((rows) =>
                        rows.filter((r) => r.id !== row.id),
                      )
                    }
                    className="p-1.5 text-gray-500 hover:text-red-400"
                    aria-label="Remove category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setCategories((rows) => [
                  ...rows,
                  {
                    id: crypto.randomUUID(),
                    name: '',
                    weight: '',
                    dropLowest: '0',
                  },
                ])
              }
              className="mt-2 text-sm text-secondary hover:underline"
            >
              + Add category
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onClose(course?.id ?? null)}
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/85"
          >
            {course ? 'Save changes' : 'Create course'}
          </button>
        </div>
      </div>
    </form>
  )
}
