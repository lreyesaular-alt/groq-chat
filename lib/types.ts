export type Role = 'user' | 'assistant'

/** Métricas devueltas por el endpoint de servidor para una respuesta concreta. */
export type ResponseStats = {
  /** Tokens consumidos por el prompt (entrada). */
  promptTokens: number
  /** Tokens generados en la respuesta (salida). */
  completionTokens: number
  /** Total de tokens de la respuesta. */
  totalTokens: number
  /** Modelo que generó la respuesta (id interno de la app). */
  model: string
  /** Id exacto enviado al proveedor (p. ej. `llama-3.3-70b-versatile`). */
  providerModelId?: string
  /** Proveedor efectivo: Groq directo o AI Gateway. */
  provider?: 'groq' | 'gateway'
  /** Tiempo de respuesta en milisegundos. */
  responseTimeMs: number
  /** Tokens de salida por segundo. */
  tokensPerSecond: number
}

export type Message = {
  id: string
  role: Role
  content: string
  createdAt: number
  /** Sólo presente en mensajes del asistente. */
  stats?: ResponseStats
}

export type Conversation = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  /** Modelo seleccionado para esta conversación. */
  modelId: string
  messages: Message[]
  /** Total acumulado de tokens de la conversación. */
  totalTokens: number
}

/** Cuerpo de la petición al endpoint /api/chat. */
export type ChatRequestBody = {
  modelId: string
  messages: Array<Pick<Message, 'role' | 'content'>>
}

/** Respuesta correcta del endpoint /api/chat. */
export type ChatResponseBody = {
  content: string
  stats: ResponseStats
}

/** Respuesta de error del endpoint /api/chat. */
export type ChatErrorBody = {
  error: string
}
