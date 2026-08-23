'use client'

import { ChevronDown } from 'lucide-react'

import { MODELS } from '@/lib/models'

type ModelSelectorProps = {
  value: string
  onChange: (modelId: string) => void
  disabled?: boolean
}

export function ModelSelector({
  value,
  onChange,
  disabled,
}: ModelSelectorProps) {
  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="model-select" className="sr-only">
        Modelo de lenguaje
      </label>
      <select
        id="model-select"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 cursor-pointer appearance-none rounded-md border border-border bg-card pr-7 pl-2.5 font-mono text-xs text-foreground transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground"
      />
    </div>
  )
}
