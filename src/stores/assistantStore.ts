import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKey } from '../lib/storage'
import type { ChatMessage } from '../types/assistant'

interface AssistantState {
  messages: ChatMessage[]
  addMessage: (message: Omit<ChatMessage, 'id'>) => void
  clearMessages: () => void
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      messages: [],

      addMessage: (message) =>
        set((s) => ({
          messages: [...s.messages, { ...message, id: crypto.randomUUID() }],
        })),

      clearMessages: () => set({ messages: [] }),
    }),
    { name: storageKey('assistant') },
  ),
)
