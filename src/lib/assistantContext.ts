import type { Assignment, Course } from '../types/grades'
import type { Opportunity } from '../types/opportunities'
import type { Task } from '../types/tasks'
import { TYPE_LABELS } from '../types/opportunities'
import { courseGrade, letterGrade } from './gradeCalc'

/**
 * CLAUDE.md specifies claude-sonnet-4-20250514, but that model retires
 * 2026-06-15; claude-sonnet-4-6 is its documented drop-in replacement.
 */
export const CLAUDE_MODEL = 'claude-sonnet-4-6'

const MAX_ITEMS = 20

export function buildSystemPrompt(
  courses: Course[],
  assignments: Assignment[],
  tasks: Task[],
  opportunities: Opportunity[],
): string {
  const lines: string[] = [
    'You are the AI assistant built into Axiom, a personal academic command center used by a UCSD Human Biology student on the pre-med/MD-PhD track.',
    'Help with study planning, grade strategy, deadlines, and application decisions. Be concise and concrete; use the live app data below when relevant.',
    '',
    `Today's date: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Courses & grades',
  ]

  if (courses.length === 0) {
    lines.push('(no courses tracked)')
  } else {
    for (const course of courses) {
      const grade = courseGrade(course, assignments)
      const gradeText =
        grade === null
          ? 'no grades yet'
          : `${grade.toFixed(1)}% (${letterGrade(grade)})`
      lines.push(
        `- ${course.name} (${course.term}, ${course.units} units): ${gradeText}`,
      )
    }
  }

  lines.push('', '## Open tasks')
  const openTasks = tasks.filter((t) => t.status !== 'done').slice(0, MAX_ITEMS)
  if (openTasks.length === 0) {
    lines.push('(no open tasks)')
  } else {
    for (const t of openTasks) {
      const due = t.dueDate ? `due ${t.dueDate}` : 'no deadline'
      lines.push(`- ${t.title} (${t.type}, ${t.status}, ${due})`)
    }
  }

  lines.push('', '## Opportunities & applications')
  const opps = opportunities.slice(0, MAX_ITEMS)
  if (opps.length === 0) {
    lines.push('(no opportunities tracked)')
  } else {
    for (const o of opps) {
      const deadline = o.deadline ? `deadline ${o.deadline}` : 'no deadline'
      const org = o.organization ? ` @ ${o.organization}` : ''
      lines.push(
        `- ${o.name}${org} (${TYPE_LABELS[o.type]}, status: ${o.status}, ${deadline})`,
      )
    }
  }

  return lines.join('\n')
}
