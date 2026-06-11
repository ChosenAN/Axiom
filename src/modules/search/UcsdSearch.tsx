import Anthropic from '@anthropic-ai/sdk'
import { Clock, Search, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { CLAUDE_MODEL } from '../../lib/assistantContext'
import { useSearchStore } from '../../stores/searchStore'
import { useSettingsStore } from '../../stores/settingsStore'

const inputClass =
  'rounded-lg border border-white/10 bg-bg px-3 py-2 text-sm text-white outline-none focus:border-accent'

const SYSTEM_PROMPT = `You are the course-research tool inside Axiom, an academic app for a UCSD student.
Given a UCSD professor name and/or course code, search the web and report:
1. RateMyProfessors: overall quality, difficulty, would-take-again %, number of ratings, and 2-3 recurring themes from reviews.
2. CAPE/SET evaluations: % recommend the professor/course, average study hours per week, expected vs. received average grade, for recent offerings.
If multiple professors match the name, list the likely candidates with departments and ask which one.
Be compact: short labeled sections, no preamble. Note when data is sparse or outdated. Include the source of each figure.`

/** Server-side web search can pause the turn; cap how many times we resume. */
const MAX_CONTINUATIONS = 3

export function UcsdSearch() {
  const apiKey = useSettingsStore((s) => s.apiKey)
  const results = useSearchStore((s) => s.results)
  const addResult = useSearchStore((s) => s.addResult)
  const deleteResult = useSearchStore((s) => s.deleteResult)

  const [query, setQuery] = useState('')
  /** Streaming search text; null = not searching. */
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const history = [...results].sort((a, b) =>
    b.fetchedAt.localeCompare(a.fetchedAt),
  )
  const selected = results.find((r) => r.id === selectedId) ?? null

  async function search(e: FormEvent) {
    e.preventDefault()
    const text = query.trim()
    if (!text || draft !== null) return

    setError(null)
    setSelectedId(null)
    setDraft('')

    try {
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const messages: Anthropic.MessageParam[] = [
        { role: 'user', content: text },
      ]
      let full = ''
      for (let i = 0; i <= MAX_CONTINUATIONS; i++) {
        const stream = client.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: 8192,
          system: SYSTEM_PROMPT,
          tools: [{ type: 'web_search_20260209', name: 'web_search' }],
          messages,
        })
        stream.on('text', (delta) => setDraft((d) => (d ?? '') + delta))
        const final = await stream.finalMessage()
        full += final.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('')
        if (final.stop_reason !== 'pause_turn') break
        messages.push({ role: 'assistant', content: final.content })
      }
      const id = addResult({
        query: text,
        content: full,
        fetchedAt: new Date().toISOString(),
      })
      setSelectedId(id)
      setQuery('')
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        setError('Invalid API key. Set it in the AI Assistant module.')
      } else if (err instanceof Anthropic.RateLimitError) {
        setError('Rate limited by the API. Wait a moment and try again.')
      } else if (err instanceof Anthropic.APIError) {
        setError(`API error (${err.status}): ${err.message}`)
      } else {
        setError('Search failed. Check your connection and try again.')
      }
    } finally {
      setDraft(null)
    }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="mb-1 text-2xl font-semibold text-white">UCSD Search</h2>
      <p className="mb-4 text-sm text-gray-500">
        Professor ratings and grade distributions, researched live via Claude
        web search.
      </p>

      {!apiKey && (
        <p className="mb-4 rounded-xl bg-surface p-4 text-sm text-gray-400">
          Set your Anthropic API key in the AI Assistant module to enable
          search.
        </p>
      )}

      <form onSubmit={search} className="mb-4 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Professor and/or course, e.g. "Hermanowicz CHEM 6A"'
          disabled={!apiKey || draft !== null}
          className={`flex-1 ${inputClass} disabled:opacity-50`}
        />
        <button
          type="submit"
          disabled={!apiKey || draft !== null || !query.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Search size={14} /> {draft !== null ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {draft !== null && (
        <ResultCard
          title="Searching…"
          content={draft || 'Looking up ratings and evaluations…'}
          pending
        />
      )}

      {selected && draft === null && (
        <ResultCard
          title={selected.query}
          subtitle={`Fetched ${selected.fetchedAt.slice(0, 10)}`}
          content={selected.content}
        />
      )}

      {history.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-400">
            <Clock size={14} /> Past searches
          </h3>
          <div className="flex flex-col gap-1">
            {history.map((r) => (
              <div
                key={r.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  r.id === selectedId ? 'bg-accent/10' : 'hover:bg-white/5'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className="flex-1 truncate text-left text-sm text-gray-300"
                >
                  {r.query}
                  <span className="ml-2 text-xs text-gray-500">
                    {r.fetchedAt.slice(0, 10)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteResult(r.id)
                    if (selectedId === r.id) setSelectedId(null)
                  }}
                  aria-label={`Delete search "${r.query}"`}
                  className="text-gray-600 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ResultCard({
  title,
  subtitle,
  content,
  pending = false,
}: {
  title: string
  subtitle?: string
  content: string
  pending?: boolean
}) {
  return (
    <section className="rounded-xl bg-surface p-5">
      <h3 className={`font-medium ${pending ? 'text-gray-400' : 'text-white'}`}>
        {title}
      </h3>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-200">
        {content}
        {pending && <span className="animate-pulse text-gray-500"> ▍</span>}
      </p>
    </section>
  )
}
