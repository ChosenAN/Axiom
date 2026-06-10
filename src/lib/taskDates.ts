export type DueBucket = 'overdue' | 'today' | 'week' | 'later' | 'none'

/** Parse YYYY-MM-DD as a local date (not UTC) so "today" matches the user's day. */
function parseLocalDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

const DAY_MS = 86_400_000

export function dueBucket(
  dueDate: string | null,
  now: Date = new Date(),
): DueBucket {
  if (!dueDate) return 'none'
  const due = parseLocalDate(dueDate)
  if (!due) return 'none'
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((due.getTime() - today.getTime()) / DAY_MS)
  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 7) return 'week'
  return 'later'
}

/** Sort comparator: earlier deadlines first, no deadline last. */
export function compareDueDates(a: string | null, b: string | null): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  // ISO dates compare correctly as strings.
  return a < b ? -1 : a > b ? 1 : 0
}

export function formatDueDate(iso: string): string {
  const date = parseLocalDate(iso)
  if (!date) return iso
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
