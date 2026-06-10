\# Axiom — Student Command Center



\## Project

Personal academic OS for a UCSD Human Biology pre-med/MD-PhD student.

Vite + React + TypeScript + Tailwind CSS + Zustand + Recharts.

Single-page app, dark theme, all data in localStorage.



\## Modules (build in this order)

1\. Grade Tracker — weighted categories, points-based, what-if simulator

2\. Task Tracker — kanban + list view, deadlines, assignments/exams

3\. Opportunity Tracker — summer programs, scholarships, application status

4\. Dashboard — unified overview pulling from all modules

5\. AI Assistant — Claude API chat with app context injected

6\. UCSD Search — RMP ratings + CAPE grade distributions



\## Stack

\- Vite + React + TypeScript

\- Tailwind CSS (dark mode default)

\- Zustand (global state)

\- Recharts (grade visualizations)

\- Lucide React (icons)

\- Claude API: claude-sonnet-4-20250514



\## Design

\- Background: #0F1117, Accent: #6366F1 (indigo), Secondary: #06B6D4 (cyan)

\- Card surfaces: #1A1D27

\- Dark mode default, tabular-nums for grade display



\## Rules

\- TypeScript strict mode, no any

\- All data persisted to localStorage under keys prefixed axiom\_v1\_\*

\- Never hardcode API keys — user inputs in Settings, stored in localStorage

\- Build one module at a time, fully working before moving to next

