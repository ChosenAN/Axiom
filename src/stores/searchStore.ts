import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKey } from '../lib/storage'
import type { SearchResult } from '../types/search'

interface SearchState {
  results: SearchResult[]
  addResult: (result: Omit<SearchResult, 'id'>) => string
  deleteResult: (id: string) => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      results: [],

      addResult: (result) => {
        const id = crypto.randomUUID()
        set((s) => ({ results: [...s.results, { ...result, id }] }))
        return id
      },

      deleteResult: (id) =>
        set((s) => ({
          results: s.results.filter((r) => r.id !== id),
        })),
    }),
    { name: storageKey('search') },
  ),
)
