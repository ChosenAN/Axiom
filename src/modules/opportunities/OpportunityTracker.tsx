import { useState } from 'react'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  compareDueDates,
  dueBucket,
  formatDueDate,
  type DueBucket,
} from '../../lib/taskDates'
import { useOpportunityStore } from '../../stores/opportunityStore'
import {
  TYPE_LABELS,
  type Opportunity,
  type OpportunityStatus,
  type OpportunityType,
} from '../../types/opportunities'
import { OpportunityForm } from './OpportunityForm'

const STATUSES: { value: OpportunityStatus; label: string }[] = [
  { value: 'interested', label: 'Interested' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'interview', label: 'Interview' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_COLORS: Record<OpportunityStatus, string> = {
  interested: 'text-gray-400',
  preparing: 'text-accent',
  submitted: 'text-secondary',
  interview: 'text-amber-400',
  accepted: 'text-green-400',
  waitlisted: 'text-amber-400',
  rejected: 'text-gray-500',
}

const TYPE_STYLES: Record<OpportunityType, string> = {
  'summer-program': 'bg-accent/10 text-accent',
  scholarship: 'bg-amber-500/10 text-amber-300',
  research: 'bg-secondary/10 text-secondary',
  volunteering: 'bg-green-500/10 text-green-300',
  other: 'bg-white/5 text-gray-400',
}

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

export function OpportunityTracker() {
  const opportunities = useOpportunityStore((s) => s.opportunities)
  const [typeFilter, setTypeFilter] = useState<OpportunityType | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Opportunity | null>(null)

  const filtered =
    typeFilter === 'all'
      ? opportunities
      : opportunities.filter((o) => o.type === typeFilter)

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">
          Opportunity Tracker
        </h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/85"
        >
          <Plus size={16} />
          Add opportunity
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ...Object.entries(TYPE_LABELS),
          ] as [OpportunityType | 'all', string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTypeFilter(value)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              typeFilter === value
                ? 'bg-accent text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showForm && (
        <OpportunityForm
          opportunity={editing ?? undefined}
          onClose={closeForm}
        />
      )}

      {filtered.length === 0 && !showForm ? (
        <p className="text-gray-500">
          {opportunities.length === 0
            ? 'Nothing tracked yet. Add summer programs, scholarships, and research positions as you find them.'
            : 'No opportunities of this type.'}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {STATUSES.map(({ value, label }) => {
            const group = filtered
              .filter((o) => o.status === value)
              .sort((a, b) => compareDueDates(a.deadline, b.deadline))
            if (group.length === 0) return null
            return (
              <div key={value}>
                <h3
                  className={`mb-2 text-xs font-medium tracking-wide uppercase ${STATUS_COLORS[value]}`}
                >
                  {label} · {group.length}
                </h3>
                <div className="flex flex-col gap-2">
                  {group.map((o) => (
                    <OpportunityCard
                      key={o.id}
                      opportunity={o}
                      onEdit={() => {
                        setEditing(o)
                        setShowForm(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function OpportunityCard({
  opportunity: o,
  onEdit,
}: {
  opportunity: Opportunity
  onEdit: () => void
}) {
  const updateOpportunity = useOpportunityStore((s) => s.updateOpportunity)
  const deleteOpportunity = useOpportunityStore((s) => s.deleteOpportunity)

  const bucket: DueBucket =
    o.deadline && !CLOSED_STATUSES.includes(o.status)
      ? dueBucket(o.deadline)
      : 'none'

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white">{o.name}</h4>
            {o.url && (
              <a
                href={o.url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-500 hover:text-secondary"
                aria-label={`Open ${o.name} link`}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          {(o.organization || o.amount) && (
            <p className="text-xs text-gray-500">
              {o.organization}
              {o.organization && o.amount && ' · '}
              {o.amount}
            </p>
          )}
          {o.notes && <p className="mt-1 text-xs text-gray-500">{o.notes}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_STYLES[o.type]}`}
            >
              {TYPE_LABELS[o.type]}
            </span>
            {o.deadline && (
              <span
                className={`grade-num text-[11px] ${BUCKET_STYLES[bucket]}`}
              >
                {bucket === 'overdue' && 'deadline passed · '}
                due {formatDueDate(o.deadline)}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={o.status}
            onChange={(e) =>
              updateOpportunity(o.id, {
                status: e.target.value as OpportunityStatus,
              })
            }
            className="rounded border border-white/10 bg-bg px-2 py-1 text-xs text-white outline-none focus:border-accent"
            aria-label={`Status of ${o.name}`}
          >
            {STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onEdit}
            className="text-gray-500 hover:text-white"
            aria-label={`Edit ${o.name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => deleteOpportunity(o.id)}
            className="text-gray-500 hover:text-red-400"
            aria-label={`Delete ${o.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
