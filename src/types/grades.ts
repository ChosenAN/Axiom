export type GradingMode = 'weighted' | 'points'

export interface Category {
  id: string
  name: string
  /** Percent of the course grade (weighted mode only). */
  weight: number
  /** Number of lowest-percentage scores dropped from this category. */
  dropLowest: number
}

export interface Course {
  id: string
  name: string
  term: string
  units: number
  gradingMode: GradingMode
  /** Empty for points-based courses. */
  categories: Category[]
}

export interface Assignment {
  id: string
  courseId: string
  /** null for points-based courses. */
  categoryId: string | null
  name: string
  /** null = not yet graded. */
  earned: number | null
  total: number
}
