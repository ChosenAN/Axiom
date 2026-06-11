import Anthropic from '@anthropic-ai/sdk'
import { KeyRound, Send, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { buildSystemPrompt, CLAUDE_MODEL } from '../../lib/assistantContext'
import { useAssistantStore } from '../../stores/assistantStore'
import { useGradeStore } from '../../stores/gradeStore'
import { useOpportunityStore } from '../../stores/opportunityStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useTaskStore } from '../../stores/taskStore'
import type { ChatMessage } from '../../types/assistant'

const inputClass =
  'rounded-lg border border-white/10 bg-bg px-3 py-2 text-sm text-white outline-none focus:border-accent'

export function Assistant() {
  const apiKey = useSettingsStore((s) => s.apiKey)
  const messages = useAssistantStore((s) => s.messages)
  const addMessage = useAssistantStore((s) => s.addMessage)
  const clearMessages = useAssistantStore((s) => s.clearMessages)

  const courses = useGradeStore((s) => s.courses)
  const assignments = useGradeStore((s) => s.assignments)
  const tasks = useTaskStore((s) => s.tasks)
  const opportunities = useOpportunityStore((s) => s.opportunities)

  const [input, setInput] = useState('')
  /** Assistant text accumulating during a stream; null = not streaming. */
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showKeyForm, setShowKeyForm] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, draft])

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || draft !== null) return

    setInput('')
    setError(null)
    addMessage({ role: 'user', content: text })
    setDraft('')

    const history: Anthropic.MessageParam[] = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: text },
    ]

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const stream = client.messages.stream({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        system: buildSystemPrompt(courses, assignments, tasks, opportunities),
        messages: history,
      })
      stream.on('text', (delta) => setDraft((d) => (d ?? '') + delta))
      const final = await stream.finalMessage()
      const reply = final.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('')
      addMessage({ role: 'assistant', content: reply })
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        setError('Invalid API key. Update it and try again.')
        setShowKeyForm(true)
      } else if (err instanceof Anthropic.RateLimitError) {
        setError('Rate limited by the API. Wait a moment and try again.')
      } else if (err instanceof Anthropic.APIError) {
        setError(`API error (${err.status}): ${err.message}`)
      } else {
        setError('Request failed. Check your connection and try again.')
      }
    } finally {
      setDraft(null)
    }
  }

  return (
    <div className="flex h-full max-w-3xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">AI Assistant</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowKeyForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 hover:bg-white/5"
          >
            <KeyRound size={14} /> API key
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              disabled={draft !== null}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 hover:bg-white/5 disabled:opacity-50"
            >
              <Trash2 size={14} /> Clear chat
            </button>
          )}
        </div>
      </div>

      {(showKeyForm || !apiKey) && (
        <ApiKeyForm hasKey={apiKey !== ''} onSaved={() => setShowKeyForm(false)} />
      )}

      <div
        ref={scrollRef}
        className="mb-4 flex-1 overflow-y-auto rounded-xl bg-surface p-5"
      >
        {messages.length === 0 && draft === null ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <Sparkles size={24} className="text-accent" />
            <p className="text-sm text-gray-400">
              Ask about your grades, deadlines, or applications.
            </p>
            <p className="text-xs text-gray-500">
              Your courses, tasks, and opportunities are shared with Claude as
              context.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
            {draft !== null && (
              <Bubble
                message={{ id: 'draft', role: 'assistant', content: draft }}
                pending={draft === ''}
              />
            )}
          </div>
        )}
      </div>

      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}

      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            apiKey ? 'Ask anything…' : 'Add your API key above to start'
          }
          disabled={!apiKey || draft !== null}
          className={`flex-1 ${inputClass} disabled:opacity-50`}
        />
        <button
          type="submit"
          disabled={!apiKey || draft !== null || !input.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  )
}

function Bubble({
  message,
  pending = false,
}: {
  message: ChatMessage
  pending?: boolean
}) {
  const isUser = message.role === 'user'
  return (
    <div
      className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm ${
        isUser
          ? 'self-end bg-accent/15 text-white'
          : 'self-start bg-white/5 text-gray-200'
      }`}
    >
      {pending ? (
        <span className="animate-pulse text-gray-500">…</span>
      ) : (
        message.content
      )}
    </div>
  )
}

function ApiKeyForm({
  hasKey,
  onSaved,
}: {
  hasKey: boolean
  onSaved: () => void
}) {
  const setApiKey = useSettingsStore((s) => s.setApiKey)
  const [value, setValue] = useState('')

  function save(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    setApiKey(value)
    setValue('')
    onSaved()
  }

  return (
    <form onSubmit={save} className="mb-4 rounded-xl bg-surface p-5">
      <h3 className="mb-1 font-medium text-white">
        {hasKey ? 'Update Anthropic API key' : 'Set up the assistant'}
      </h3>
      <p className="mb-3 text-xs text-gray-500">
        Stored only in this browser&apos;s localStorage. Get a key at
        console.anthropic.com.
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-ant-…"
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  )
}
