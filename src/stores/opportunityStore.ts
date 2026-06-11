import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKey } from '../lib/storage'
import type { Opportunity } from '../types/opportunities'

interface OpportunityState {
  opportunities: Opportunity[]
  addOpportunity: (opportunity: Omit<Opportunity, 'id'>) => void
  updateOpportunity: (
    id: string,
    patch: Partial<Omit<Opportunity, 'id'>>,
  ) => void
  deleteOpportunity: (id: string) => void
}

export const useOpportunityStore = create<OpportunityState>()(
  persist(
    (set) => ({
      opportunities: [],

      addOpportunity: (opportunity) =>
        set((s) => ({
          opportunities: [
            ...s.opportunities,
            { ...opportunity, id: crypto.randomUUID() },
          ],
        })),

      updateOpportunity: (id, patch) =>
        set((s) => ({
          opportunities: s.opportunities.map((o) =>
            o.id === id ? { ...o, ...patch } : o,
          ),
        })),

      deleteOpportunity: (id) =>
        set((s) => ({
          opportunities: s.opportunities.filter((o) => o.id !== id),
        })),
    }),
    { name: storageKey('opportunities') },
  ),
)
