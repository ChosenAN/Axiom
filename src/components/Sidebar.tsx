import {
  GraduationCap,
  ListTodo,
  Award,
  LayoutDashboard,
  Sparkles,
  Search,
} from 'lucide-react'
import { useNavStore, type ModuleId } from '../stores/navStore'

interface ModuleEntry {
  id: ModuleId
  label: string
  icon: typeof GraduationCap
  enabled: boolean
}

const MODULES: ModuleEntry[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
  { id: 'grades', label: 'Grade Tracker', icon: GraduationCap, enabled: true },
  { id: 'tasks', label: 'Task Tracker', icon: ListTodo, enabled: true },
  { id: 'opportunities', label: 'Opportunities', icon: Award, enabled: true },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles, enabled: true },
  { id: 'search', label: 'UCSD Search', icon: Search, enabled: false },
]

export function Sidebar() {
  const active = useNavStore((s) => s.active)
  const setActive = useNavStore((s) => s.setActive)

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/5 bg-surface">
      <div className="px-5 py-6">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Axiom
        </h1>
        <p className="text-xs text-gray-500">Student Command Center</p>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {MODULES.map(({ id, label, icon: Icon, enabled }) => (
          <button
            key={id}
            type="button"
            disabled={!enabled}
            onClick={() => setActive(id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              active === id
                ? 'bg-accent/15 text-accent'
                : enabled
                  ? 'text-gray-300 hover:bg-white/5'
                  : 'cursor-not-allowed text-gray-600'
            }`}
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {!enabled && (
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">
                Soon
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  )
}
