import { generateText } from 'ai'

import {
  MissingProviderCredentialsError,
  resolveModel,
} from '@/lib/ai-provider.server'
import { DEFAULT_MODEL_ID, isValidModelId } from '@/lib/models'
import type { ChatRequestBody, ChatResponseBody } from '@/lib/types'

const MAX_MESSAGES = 40
const MAX_CHARS_PER_MESSAGE = 8000

const SYSTEM_PROMPT =
  'Eres un asistente útil, directo y preciso. Responde en el idioma del usuario. ' +
  'Usa markdown ligero sólo cuando aporte claridad.'

function isValidMessages(value: unknown): value is ChatRequestBody['messages'] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_MESSAGES &&
    value.every((item) => {
      if (typeof item !== 'object' || item === null) return false
      const message = item as { role?: unknown; content?: unknown }
      return (
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.length > 0 &&
        message.content.length <= MAX_CHARS_PER_MESSAGE
      )
    })
  )
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Cuerpo de petición inválido.' }, { status: 400 })
  }

  const { modelId, messages } = (body ?? {}) as Partial<ChatRequestBody>

  if (!isValidMessages(messages)) {
    return Response.json(
      { error: 'La lista de mensajes no es válida.' },
      { status: 400 },
    )
  }

  const selectedModelId = isValidModelId(modelId) ? modelId : DEFAULT_MODEL_ID

  let resolved: ReturnType<typeof resolveModel>
  try {
    resolved = resolveModel(selectedModelId)
  } catch (error) {
    if (error instanceof MissingProviderCredentialsError) {
      // 503: el código está listo, sólo falta la variable de entorno.
      return Response.json({ error: error.message }, { status: 503 })
    }
    throw error
  }

  const startedAt = Date.now()

  try {
    const result = await generateText({
      model: resolved.model,
      system: SYSTEM_PROMPT,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    })

    const responseTimeMs = Date.now() - startedAt
    const promptTokens = result.usage.inputTokens ?? 0
    const completionTokens = result.usage.outputTokens ?? 0
    const totalTokens =
      result.usage.totalTokens ?? promptTokens + completionTokens

    const payload: ChatResponseBody = {
      content: result.text,
      stats: {
        promptTokens,
        completionTokens,
        totalTokens,
        model: selectedModelId,
        providerModelId: resolved.providerModelId,
        provider: resolved.provider,
        responseTimeMs,
        tokensPerSecond:
          responseTimeMs > 0 ? completionTokens / (responseTimeMs / 1000) : 0,
      },
    }

    return Response.json(payload)
  } catch (error) {
    console.log('[v0] Error al generar la respuesta:', error)

    // Propaga el motivo real del proveedor (créditos, cuota, modelo no
    // disponible) para que el usuario sepa qué corregir.
    const detail = error instanceof Error ? error.message : ''
    return Response.json(
      {
        error: detail
          ? `No se pudo generar la respuesta: ${detail}`
          : 'No se pudo generar la respuesta. Inténtalo de nuevo.',
      },
      { status: 502 },
    )
  }
}
