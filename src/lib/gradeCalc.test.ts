import { describe, expect, it } from 'vitest'
import type { Assignment, Course } from '../types/grades'
import {
  categoryPercent,
  courseGrade,
  letterGrade,
  requiredScore,
} from './gradeCalc'

function assignment(partial: Partial<Assignment> & { id: string }): Assignment {
  return {
    courseId: 'c1',
    categoryId: null,
    name: partial.id,
    earned: null,
    total: 100,
    ...partial,
  }
}

const pointsCourse: Course = {
  id: 'c1',
  name: 'CHEM 6A',
  term: 'FA26',
  units: 4,
  gradingMode: 'points',
  categories: [],
}

const weightedCourse: Course = {
  id: 'c1',
  name: 'BILD 1',
  term: 'FA26',
  units: 4,
  gradingMode: 'weighted',
  categories: [
    { id: 'hw', name: 'Homework', weight: 40, dropLowest: 0 },
    { id: 'exams', name: 'Exams', weight: 60, dropLowest: 0 },
  ],
}

describe('categoryPercent', () => {
  it('returns null when nothing is graded', () => {
    expect(categoryPercent([assignment({ id: 'a1' })])).toBeNull()
    expect(categoryPercent([])).toBeNull()
  })

  it('computes points-based percentage across uneven totals', () => {
    const items = [
      assignment({ id: 'a1', earned: 80, total: 100 }),
      assignment({ id: 'a2', earned: 45, total: 50 }),
    ]
    // (80 + 45) / (100 + 50) = 83.33%
    expect(categoryPercent(items)).toBeCloseTo((125 / 150) * 100)
  })

  it('ignores ungraded assignments', () => {
    const items = [
      assignment({ id: 'a1', earned: 90, total: 100 }),
      assignment({ id: 'a2', earned: null }),
    ]
    expect(categoryPercent(items)).toBeCloseTo(90)
  })

  it('drops the lowest-percentage scores', () => {
    const items = [
      assignment({ id: 'a1', earned: 50, total: 100 }),
      assignment({ id: 'a2', earned: 90, total: 100 }),
      assignment({ id: 'a3', earned: 100, total: 100 }),
    ]
    expect(categoryPercent(items, 1)).toBeCloseTo(95)
  })

  it('never drops every graded score', () => {
    const items = [assignment({ id: 'a1', earned: 50, total: 100 })]
    expect(categoryPercent(items, 3)).toBeCloseTo(50)
  })

  it('applies overrides over actual scores', () => {
    const items = [assignment({ id: 'a1', earned: null, total: 100 })]
    expect(categoryPercent(items, 0, { a1: 75 })).toBeCloseTo(75)
  })
})

describe('courseGrade', () => {
  it('returns null for a course with no graded work', () => {
    expect(courseGrade(weightedCourse, [assignment({ id: 'a1' })])).toBeNull()
  })

  it('combines weighted categories', () => {
    const items = [
      assignment({ id: 'h1', categoryId: 'hw', earned: 90, total: 100 }),
      assignment({ id: 'e1', categoryId: 'exams', earned: 80, total: 100 }),
    ]
    // 90 * 0.4 + 80 * 0.6 = 84
    expect(courseGrade(weightedCourse, items)).toBeCloseTo(84)
  })

  it('renormalizes when a category has no graded work yet', () => {
    const items = [
      assignment({ id: 'h1', categoryId: 'hw', earned: 90, total: 100 }),
      assignment({ id: 'e1', categoryId: 'exams', earned: null }),
    ]
    // Only homework counts: grade is 90, not 36.
    expect(courseGrade(weightedCourse, items)).toBeCloseTo(90)
  })

  it('renormalizes weights that do not sum to 100', () => {
    const course: Course = {
      ...weightedCourse,
      categories: [
        { id: 'hw', name: 'Homework', weight: 20, dropLowest: 0 },
        { id: 'exams', name: 'Exams', weight: 30, dropLowest: 0 },
      ],
    }
    const items = [
      assignment({ id: 'h1', categoryId: 'hw', earned: 100, total: 100 }),
      assignment({ id: 'e1', categoryId: 'exams', earned: 50, total: 100 }),
    ]
    // (100 * 20 + 50 * 30) / 50 = 70
    expect(courseGrade(course, items)).toBeCloseTo(70)
  })

  it('sums all points for points-based courses', () => {
    const items = [
      assignment({ id: 'a1', earned: 18, total: 20 }),
      assignment({ id: 'a2', earned: 70, total: 80 }),
    ]
    expect(courseGrade(pointsCourse, items)).toBeCloseTo(88)
  })
})

describe('letterGrade', () => {
  it('maps cutoffs', () => {
    expect(letterGrade(97)).toBe('A+')
    expect(letterGrade(93)).toBe('A')
    expect(letterGrade(92.9)).toBe('A-')
    expect(letterGrade(83)).toBe('B')
    expect(letterGrade(70)).toBe('C-')
    expect(letterGrade(65)).toBe('D')
    expect(letterGrade(59.9)).toBe('F')
  })
})

describe('requiredScore', () => {
  const items = [
    assignment({ id: 'mid', earned: 80, total: 100 }),
    assignment({ id: 'final', earned: null, total: 100 }),
  ]

  it('solves for the needed score in a points course', () => {
    // (80 + x) / 200 = 0.9 -> x = 100
    expect(requiredScore(pointsCourse, items, 'final', 90)).toBeCloseTo(100, 3)
  })

  it('returns 0 when the target is already met', () => {
    expect(requiredScore(pointsCourse, items, 'final', 40)).toBe(0)
  })

  it('exceeds the total when the target is unreachable', () => {
    // (80 + x) / 200 = 0.99 -> x = 118
    const needed = requiredScore(pointsCourse, items, 'final', 99)
    expect(needed).not.toBeNull()
    expect(needed!).toBeCloseTo(118, 3)
  })

  it('solves within a weighted course', () => {
    const weighted = [
      assignment({ id: 'h1', categoryId: 'hw', earned: 100, total: 100 }),
      assignment({ id: 'e1', categoryId: 'exams', earned: null, total: 100 }),
    ]
    // 100 * 0.4 + x * 0.6 = 90 -> x = 83.33
    expect(
      requiredScore(weightedCourse, weighted, 'e1', 90),
    ).toBeCloseTo(250 / 3, 2)
  })

  it('returns null for an unknown assignment', () => {
    expect(requiredScore(pointsCourse, items, 'missing', 90)).toBeNull()
  })
})
