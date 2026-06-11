export type OpportunityType =
  | 'summer-program'
  | 'scholarship'
  | 'research'
  | 'volunteering'
  | 'other'

export type OpportunityStatus =
  | 'interested'
  | 'preparing'
  | 'submitted'
  | 'interview'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'

export const TYPE_LABELS: Record<OpportunityType, string> = {
  'summer-program': 'Summer program',
  scholarship: 'Scholarship',
  research: 'Research',
  volunteering: 'Volunteering',
  other: 'Other',
}

export interface Opportunity {
  id: string
  name: string
  type: OpportunityType
  organization: string
  /** Application deadline, ISO date (YYYY-MM-DD), null = none. */
  deadline: string | null
  status: OpportunityStatus
  /** Award amount or stipend, free text (e.g. "$5,000"). */
  amount: string
  url: string
  notes: string
}
