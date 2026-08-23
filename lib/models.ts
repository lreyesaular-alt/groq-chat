export type LlamaModel = {
  id: string
  label: string
  description: string
  contextLabel: string
}

/** Modelos Llama disponibles. Los ids son válidos para el AI Gateway. */
export const MODELS: LlamaModel[] = [
  {
    id: 'meta/llama-3.3-70b',
    label: 'Llama 3.3 70B',
    description: 'Equilibrio entre calidad y velocidad',
    contextLabel: '128K',
  },
  {
    id: 'meta/llama-3.1-8b',
    label: 'Llama 3.1 8B',
    description: 'El más rápido, ideal para respuestas cortas',
    contextLabel: '128K',
  },
  {
    id: 'meta/llama-4-scout',
    label: 'Llama 4 Scout',
    description: 'Multimodal ligero de última generación',
    contextLabel: '128K',
  },
  {
    id: 'meta/llama-4-maverick',
    label: 'Llama 4 Maverick',
    description: 'Máxima capacidad de razonamiento',
    contextLabel: '128K',
  },
]

export const DEFAULT_MODEL_ID = MODELS[0].id

export function isValidModelId(id: unknown): id is string {
  return typeof id === 'string' && MODELS.some((model) => model.id === id)
}

export function getModelLabel(id: string): string {
  return MODELS.find((model) => model.id === id)?.label ?? id
}
