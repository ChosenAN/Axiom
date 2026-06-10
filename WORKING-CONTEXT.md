\# Axiom — Working Context



\## Current Status

\- \[x] Project scaffold

\- \[x] Grade Tracker

\- \[x] Task Tracker

\- \[ ] Opportunity Tracker

\- \[ ] Dashboard

\- \[ ] AI Assistant

\- \[ ] UCSD Search



\## Active Module

Task Tracker complete. Next up: Opportunity Tracker.



\## Decisions Made

\- Stack: Vite + React + TS + Tailwind + Zustand + Recharts

\- Storage: localStorage only, prefix axiom\_v1\_\*

\- Design: dark theme, indigo + cyan accent

\- Tailwind v4 (CSS-first config via @tailwindcss/vite, tokens in src/index.css @theme)

\- Navigation: Zustand-held active module (navStore), no router

\- Grade model: Course/Category/Assignment in src/types/grades.ts; what-if scores are ephemeral UI state, never persisted

\- Grade math: pure functions in src/lib/gradeCalc.ts, covered by Vitest (npm test)

\- Task model: Task in src/types/tasks.ts with optional courseId link to Grade Tracker; dueDate is ISO YYYY-MM-DD; persisted to axiom\_v1\_tasks

\- Kanban drag: native HTML5 DnD (no dependency); list view groups by due-date bucket (src/lib/taskDates.ts, tested)



\## Blockers / Notes

\- scaffold-tmp/ (leftover Vite template dir) and unused template files (src/App.css, src/assets/, public/icons.svg) need manual deletion — automated deletion was blocked by permissions.

