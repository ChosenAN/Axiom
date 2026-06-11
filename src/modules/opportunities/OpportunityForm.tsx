import { useState, type FormEvent } from 'react'
import { useOpportunityStore } from '../../stores/opportunityStore'
import {
  TYPE_LABELS,
  type Opportunity,
  type OpportunityType,
} from '../../types/opportunities'

const inputClass =
  'rounded-lg border border-white/10 bg-bg px-3 py-2 text-sm text-white outline-none focus:border-accent'

export function OpportunityForm({
  opportunity,
  onClose,
}: {
  opportunity?: Opportunity
  onClose: () => void
}) {
  const addOpportunity = useOpportunityStore((s) => s.addOpportunity)
  const updateOpportunity = useOpportunityStore((s) => s.updateOpportunity)

  const [name, setName] = useState(opportunity?.name ?? '')
  const [type, setType] = useState<OpportunityType>(
    opportunity?.type ?? 'summer-program',
  )
  const [organization, setOrganization] = useState(
    opportunity?.organization ?? '',
  )
  const [deadline, setDeadline] = useState(opportunity?.deadline ?? '')
  const [amount, setAmount] = useState(opportunity?.amount ?? '')
  const [url, setUrl] = useState(opportunity?.url ?? '')
  const [notes, setNotes] = useState(opportunity?.notes ?? '')
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Opportunity name is required.')
      return
    }
    const data = {
      name: name.trim(),
      type,
      organization: organization.trim(),
      deadline: deadline || null,
      amount: amount.trim(),
      url: url.trim(),
      notes: notes.trim(),
    }
    if (opportunity) {
      updateOpportunity(opportunity.id, data)
    } else {
      addOpportunity({ ...data, status: 'interested' })
    }
    onClose()
  }

  return (
    <form onSubmit={submit} className="mb-6 rounded-xl bg-surface p-5">
      <h3 className="mb-4 font-medium text-white">
        {opportunity ? 'Edit opportunity' : 'New opportunity'}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs text-gray-400 sm:col-span-2">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="SURF, Regents Scholarship, …"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as OpportunityType)}
            className={inputClass}
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400 sm:col-span-2">
          Organization
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="UCSD, NIH, …"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Amount (optional)
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="$5,000"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Link (optional)
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            inputMode="url"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400 sm:col-span-4">
          Notes (optional)
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Requires two rec letters, essay due earlier…"
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
          {opportunity ? 'Save changes' : 'Add opportunity'}
        </button>
      </div>
    </form>
  )
}
