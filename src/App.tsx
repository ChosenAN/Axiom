import { Sidebar } from './components/Sidebar'
import { GradeTracker } from './modules/grades/GradeTracker'
import { useNavStore } from './stores/navStore'

function App() {
  const active = useNavStore((s) => s.active)

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {active === 'grades' ? (
          <GradeTracker />
        ) : (
          <p className="text-gray-500">This module is coming soon.</p>
        )}
      </main>
    </div>
  )
}

export default App
