import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKey } from '../lib/storage'

interface SettingsState {
  apiKey: string
  setApiKey: (key: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key.trim() }),
    }),
    { name: storageKey('settings') },
  ),
)
