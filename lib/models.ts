export type LlamaModel = {
  /** Identificador estable usado por el cliente y persistido en el historial. */
  id: string
  /** Id exacto del modelo en la API de Groq (https://api.groq.com/openai/v1). */
  groqModelId: string
  /** Id equivalente en el AI Gateway de Vercel, usado como alternativa. */
  gatewayModelId: string
  label: string
  description: string
  contextLabel: string
}

/**
 * Modelos Llama servidos por Groq. `groqModelId` es el identificador que espera
 * la API de Groq; `gatewayModelId` permite ejecutar el mismo modelo a través del
 * AI Gateway cuando no hay GROQ_API_KEY configurada.
 */
export const MODELS: LlamaModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    groqModelId: 'llama-3.3-70b-versatile',
    gatewayModelId: 'meta/llama-3.3-70b',
    label: 'Llama 3.3 70B',
    description: 'Equilibrio entre calidad y velocidad',
    contextLabel: '128K',
  },
  {
    id: 'llama-3.1-8b-instant',
    groqModelId: 'llama-3.1-8b-instant',
    gatewayModelId: 'meta/llama-3.1-8b',
    label: 'Llama 3.1 8B',
    description: 'El más rápido, ideal para respuestas cortas',
    contextLabel: '128K',
  },
  {
    id: 'llama-4-scout',
    groqModelId: 'meta-llama/llama-4-scout-17b-16e-instruct',
    gatewayModelId: 'meta/llama-4-scout',
    label: 'Llama 4 Scout',
    description: 'Multimodal ligero de última generación',
    contextLabel: '128K',
  },
  {
    id: 'llama-4-maverick',
    groqModelId: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    gatewayModelId: 'meta/llama-4-maverick',
    label: 'Llama 4 Maverick',
    description: 'Máxima capacidad de razonamiento',
    contextLabel: '128K',
  },
]

export const DEFAULT_MODEL_ID = MODELS[0].id

export function isValidModelId(id: unknown): id is string {
  return typeof id === 'string' && MODELS.some((model) => model.id === id)
}

export function getModel(id: string): LlamaModel {
  return MODELS.find((model) => model.id === id) ?? MODELS[0]
}

export function getModelLabel(id: string): string {
  return MODELS.find((model) => model.id === id)?.label ?? id
}
