'use client'

import { useEffect, useRef } from 'react'

import { formatDuration, formatNumber } from '@/lib/storage'
import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'

type MessageListProps = {
  messages: Message[]
  isLoading: boolean
  modelLabel: string
}

const SUGGESTIONS = [
  'Explícame la diferencia entre tokens de prompt y de completado.',
  'Resume las ventajas de la inferencia de baja latencia.',
  'Escribe una función en TypeScript que agrupe por clave.',
]

export function MessageList({
  messages,
  isLoading,
  modelLabel,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            Pregunta lo que quieras
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            Cada respuesta se mide: tokens, latencia y velocidad de generación
            aparecen en el panel «Uso de tokens». Modelo activo:{' '}
            <span className="font-mono text-foreground">{modelLabel}</span>.
          </p>
        </div>
        <ul className="flex w-full max-w-md flex-col gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <li
              key={suggestion}
              className="rounded-md border border-border bg-card px-3 py-2 text-left text-sm leading-relaxed text-muted-foreground"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <ol className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
        {messages.map((message) => (
          <li
            key={message.id}
            className={cn(
              'flex flex-col gap-1.5',
              message.role === 'user' ? 'items-end' : 'items-start',
            )}
          >
            <span className="label-mono text-muted-foreground">
              {message.role === 'user' ? 'Tú' : 'Asistente'}
            </span>
            <div
              className={cn(
                'max-w-[min(100%,42rem)] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-card-foreground',
              )}
            >
              {message.content}
            </div>
            {message.stats ? (
              <span className="font-mono text-[0.6875rem] text-muted-foreground">
                {formatNumber(message.stats.totalTokens)} tok ·{' '}
                {formatDuration(message.stats.responseTimeMs)} ·{' '}
                {message.stats.tokensPerSecond.toFixed(1)} tok/s
              </span>
            ) : null}
          </li>
        ))}

        {isLoading ? (
          <li className="flex flex-col items-start gap-1.5">
            <span className="label-mono text-muted-foreground">Asistente</span>
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-3"
            >
              <span className="flex gap-1" aria-hidden="true">
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-primary" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                Generando respuesta…
              </span>
            </div>
          </li>
        ) : null}
        <div ref={endRef} />
      </ol>
    </div>
  )
}
