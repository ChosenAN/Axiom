import { Sidebar } from './components/Sidebar'
import { Assistant } from './modules/assistant/Assistant'
import { Dashboard } from './modules/dashboard/Dashboard'
import { GradeTracker } from './modules/grades/GradeTracker'
import { OpportunityTracker } from './modules/opportunities/OpportunityTracker'
import { UcsdSearch } from './modules/search/UcsdSearch'
import { TaskTracker } from './modules/tasks/TaskTracker'
import { useNavStore } from './stores/navStore'

function App() {
  const active = useNavStore((s) => s.active)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {active === 'dashboard' ? (
          <Dashboard />
        ) : active === 'grades' ? (
          <GradeTracker />
        ) : active === 'tasks' ? (
          <TaskTracker />
        ) : active === 'opportunities' ? (
          <OpportunityTracker />
        ) : active === 'assistant' ? (
          <Assistant />
        ) : active === 'search' ? (
          <UcsdSearch />
        ) : (
          <p className="text-gray-500">This module is coming soon.</p>
        )}
      </main>
    </div>
  )
}

export default App
