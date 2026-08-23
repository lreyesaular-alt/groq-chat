// Este módulo sólo puede importarse desde el servidor: `server-only` provoca un
// error de compilación si algún componente de cliente intenta importarlo, así
// que las claves nunca pueden acabar en el bundle del navegador.
import 'server-only'

import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'

import { getModel } from '@/lib/models'

export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

export type ProviderName = 'groq' | 'gateway'

export type ResolvedModel = {
  /** Modelo listo para pasar a `generateText`. */
  model: LanguageModel
  /** Proveedor efectivo de la llamada. */
  provider: ProviderName
  /** Id real enviado al proveedor. */
  providerModelId: string
}

export class MissingProviderCredentialsError extends Error {
  constructor() {
    super(
      'Falta configuración del proveedor. Añade la variable de entorno ' +
        'GROQ_API_KEY (o AI_GATEWAY_API_KEY) al proyecto para habilitar las ' +
        'respuestas del modelo.',
    )
    this.name = 'MissingProviderCredentialsError'
  }
}

/**
 * Resuelve el modelo a utilizar según las credenciales disponibles.
 *
 * 1. Si existe GROQ_API_KEY se llama a la API de Groq directamente (es
 *    compatible con el protocolo de OpenAI, de ahí `createOpenAICompatible`).
 * 2. Si no, se usa el AI Gateway de Vercel con el id equivalente del modelo.
 *
 * La clave se lee siempre en el servidor y nunca se devuelve al cliente.
 */
export function resolveModel(modelId: string): ResolvedModel {
  const entry = getModel(modelId)
  const groqApiKey = process.env.GROQ_API_KEY

  if (groqApiKey) {
    const groq = createOpenAICompatible({
      name: 'groq',
      baseURL: GROQ_BASE_URL,
      apiKey: groqApiKey,
    })

    return {
      model: groq.chatModel(entry.groqModelId),
      provider: 'groq',
      providerModelId: entry.groqModelId,
    }
  }

  const hasGatewayAccess = Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
  )

  if (!hasGatewayAccess) {
    throw new MissingProviderCredentialsError()
  }

  return {
    model: entry.gatewayModelId,
    provider: 'gateway',
    providerModelId: entry.gatewayModelId,
  }
}
