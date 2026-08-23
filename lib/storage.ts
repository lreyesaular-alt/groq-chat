import { DEFAULT_MODEL_ID, isValidModelId } from '@/lib/models'
import type { Conversation, Message, Role } from '@/lib/types'

const STORAGE_KEY = 'groq-chat:conversations:v1'

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createConversation(modelId = DEFAULT_MODEL_ID): Conversation {
  const now = Date.now()
  return {
    id: createId(),
    title: 'Nueva conversación',
    createdAt: now,
    updatedAt: now,
    modelId,
    messages: [],
    totalTokens: 0,
  }
}

/** Deriva un título legible a partir del primer mensaje del usuario. */
export function deriveTitle(content: string): string {
  const clean = content.replace(/\s+/g, ' ').trim()
  if (!clean) return 'Nueva conversación'
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean
}

function isRole(value: unknown): value is Role {
  return value === 'user' || value === 'assistant'
}

/** Valida la forma de los datos leídos de localStorage antes de usarlos. */
function parseConversations(raw: string): Conversation[] {
  const data: unknown = JSON.parse(raw)
  if (!Array.isArray(data)) return []

  return data.flatMap((item): Conversation[] => {
    if (typeof item !== 'object' || item === null) return []
    const candidate = item as Partial<Conversation>
    if (typeof candidate.id !== 'string') return []

    const messages = Array.isArray(candidate.messages)
      ? candidate.messages.flatMap((message): Message[] => {
          if (typeof message !== 'object' || message === null) return []
          const m = message as Partial<Message>
          if (typeof m.content !== 'string' || !isRole(m.role)) return []
          return [
            {
              id: typeof m.id === 'string' ? m.id : createId(),
              role: m.role,
              content: m.content,
              createdAt:
                typeof m.createdAt === 'number' ? m.createdAt : Date.now(),
              stats: m.stats,
            },
          ]
        })
      : []

    return [
      {
        id: candidate.id,
        title: typeof candidate.title === 'string' ? candidate.title : 'Chat',
        createdAt:
          typeof candidate.createdAt === 'number' ? candidate.createdAt : 0,
        updatedAt:
          typeof candidate.updatedAt === 'number' ? candidate.updatedAt : 0,
        modelId: isValidModelId(candidate.modelId)
          ? candidate.modelId
          : DEFAULT_MODEL_ID,
        messages,
        totalTokens:
          typeof candidate.totalTokens === 'number' ? candidate.totalTokens : 0,
      },
    ]
  })
}

export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return parseConversations(raw)
  } catch (error) {
    console.log('[v0] No se pudo leer el historial guardado:', error)
    return []
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch (error) {
    console.log('[v0] No se pudo guardar el historial:', error)
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-ES').format(Math.round(value))
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function formatRelativeDate(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return 'ahora'
  if (diff < hour) return `hace ${Math.floor(diff / minute)} min`
  if (diff < day) return `hace ${Math.floor(diff / hour)} h`
  if (diff < 7 * day) return `hace ${Math.floor(diff / day)} d`
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(timestamp)
}
