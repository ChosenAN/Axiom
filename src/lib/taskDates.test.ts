import { describe, expect, it } from 'vitest'
import { compareDueDates, dueBucket } from './taskDates'

// Fixed reference date: Wednesday 2026-06-10 (local), mid-afternoon.
const now = new Date(2026, 5, 10, 15, 30)

describe('dueBucket', () => {
  it('returns none for missing or malformed dates', () => {
    expect(dueBucket(null, now)).toBe('none')
    expect(dueBucket('next tuesday', now)).toBe('none')
  })

  it('classifies past dates as overdue', () => {
    expect(dueBucket('2026-06-09', now)).toBe('overdue')
    expect(dueBucket('2025-12-31', now)).toBe('overdue')
  })

  it('classifies the current local day as today', () => {
    expect(dueBucket('2026-06-10', now)).toBe('today')
  })

  it('classifies the next 7 days as week', () => {
    expect(dueBucket('2026-06-11', now)).toBe('week')
    expect(dueBucket('2026-06-17', now)).toBe('week')
  })

  it('classifies beyond 7 days as later', () => {
    expect(dueBucket('2026-06-18', now)).toBe('later')
    expect(dueBucket('2026-09-01', now)).toBe('later')
  })
})

describe('compareDueDates', () => {
  it('sorts earlier dates first and nulls last', () => {
    const dates = [null, '2026-06-20', '2026-06-11', null, '2026-01-05']
    const sorted = [...dates].sort(compareDueDates)
    expect(sorted).toEqual([
      '2026-01-05',
      '2026-06-11',
      '2026-06-20',
      null,
      null,
    ])
  })

  it('treats equal dates as equal', () => {
    expect(compareDueDates('2026-06-10', '2026-06-10')).toBe(0)
  })
})
