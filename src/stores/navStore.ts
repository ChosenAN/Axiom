import { create } from 'zustand'

export type ModuleId =
  | 'grades'
  | 'tasks'
  | 'opportunities'
  | 'dashboard'
  | 'assistant'
  | 'search'

interface NavState {
  active: ModuleId
  setActive: (module: ModuleId) => void
}

export const useNavStore = create<NavState>((set) => ({
  active: 'dashboard',
  setActive: (module) => set({ active: module }),
}))
