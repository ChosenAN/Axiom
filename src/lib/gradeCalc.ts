import type { Assignment, Course } from '../types/grades'

/** What-if scores keyed by assignment id; takes precedence over actual earned. */
export type ScoreOverrides = Readonly<Record<string, number>>

interface GradedItem {
  earned: number
  total: number
  pct: number
}

function resolvedEarned(
  assignment: Assignment,
  overrides?: ScoreOverrides,
): number | null {
  if (overrides && assignment.id in overrides) return overrides[assignment.id]
  return assignment.earned
}

function gradedItems(
  assignments: Assignment[],
  overrides?: ScoreOverrides,
): GradedItem[] {
  const items: GradedItem[] = []
  for (const a of assignments) {
    const earned = resolvedEarned(a, overrides)
    if (earned === null || a.total <= 0) continue
    items.push({ earned, total: a.total, pct: earned / a.total })
  }
  return items
}

/**
 * Percentage (0-100) for a set of assignments: sum of earned over sum of
 * total after dropping the `dropLowest` lowest-percentage scores.
 * Returns null when nothing is graded yet.
 */
export function categoryPercent(
  assignments: Assignment[],
  dropLowest = 0,
  overrides?: ScoreOverrides,
): number | null {
  let items = gradedItems(assignments, overrides)
  if (items.length === 0) return null
  if (dropLowest > 0 && items.length > 1) {
    items = [...items]
      .sort((a, b) => a.pct - b.pct)
      .slice(Math.min(dropLowest, items.length - 1))
  }
  let earned = 0
  let total = 0
  for (const item of items) {
    earned += item.earned
    total += item.total
  }
  return (earned / total) * 100
}

/**
 * Current course grade as a percentage (0-100), or null when nothing is
 * graded. Weighted mode renormalizes over categories that have at least one
 * graded assignment, so empty categories don't count as zero.
 */
export function courseGrade(
  course: Course,
  assignments: Assignment[],
  overrides?: ScoreOverrides,
): number | null {
  const courseAssignments = assignments.filter((a) => a.courseId === course.id)
  if (course.gradingMode === 'points') {
    return categoryPercent(courseAssignments, 0, overrides)
  }
  let weightedSum = 0
  let weightTotal = 0
  for (const category of course.categories) {
    const pct = categoryPercent(
      courseAssignments.filter((a) => a.categoryId === category.id),
      category.dropLowest,
      overrides,
    )
    if (pct === null || category.weight <= 0) continue
    weightedSum += pct * category.weight
    weightTotal += category.weight
  }
  return weightTotal === 0 ? null : weightedSum / weightTotal
}

const LETTER_CUTOFFS: ReadonlyArray<readonly [number, string]> = [
  [97, 'A+'],
  [93, 'A'],
  [90, 'A-'],
  [87, 'B+'],
  [83, 'B'],
  [80, 'B-'],
  [77, 'C+'],
  [73, 'C'],
  [70, 'C-'],
  [60, 'D'],
]

export function letterGrade(pct: number): string {
  for (const [cutoff, letter] of LETTER_CUTOFFS) {
    if (pct >= cutoff) return letter
  }
  return 'F'
}

/**
 * Points needed on one ungraded assignment to reach `targetPct` overall,
 * holding everything else at its current (or overridden) score. May exceed
 * the assignment's total, meaning the target is unreachable. Returns null
 * when the assignment doesn't exist or can't influence the grade.
 */
export function requiredScore(
  course: Course,
  assignments: Assignment[],
  assignmentId: string,
  targetPct: number,
  overrides?: ScoreOverrides,
): number | null {
  const target = assignments.find((a) => a.id === assignmentId)
  if (!target || target.total <= 0) return null

  const gradeAt = (x: number) =>
    courseGrade(course, assignments, { ...overrides, [assignmentId]: x })
  const low = gradeAt(0)
  const high = gradeAt(target.total)
  if (low === null || high === null || high <= low) return null
  if (low >= targetPct) return 0
  if (high < targetPct) {
    // Unreachable: extrapolate past the max so callers can show the gap.
    const slope = (high - low) / target.total
    return target.total + (targetPct - high) / slope
  }
  // Bisection instead of a linear solve: drop-lowest makes the grade
  // piecewise-linear in x, though still monotonic.
  let lo = 0
  let hi = target.total
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    const g = gradeAt(mid)
    if (g === null) return null
    if (g < targetPct) lo = mid
    else hi = mid
  }
  return hi
}
