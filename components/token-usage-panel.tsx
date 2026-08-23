'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getModelLabel } from '@/lib/models'
import { formatDuration, formatNumber } from '@/lib/storage'
import type { ResponseStats } from '@/lib/types'

type TokenUsagePanelProps = {
  stats: ResponseStats | null
  sessionTokens: number
  onClose?: () => void
}

function Metric({
  label,
  value,
  unit,
  emphasis,
}: {
  label: string
  value: string
  unit?: string
  emphasis?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border px-4 py-3 last:border-b-0">
      <span className="label-mono text-muted-foreground">{label}</span>
      <span className="flex items-baseline gap-1">
        <span
          className={
            emphasis
              ? 'font-mono text-2xl leading-none tracking-tight text-primary'
              : 'font-mono text-lg leading-none tracking-tight text-foreground'
          }
        >
          {value}
        </span>
        {unit ? (
          <span className="font-mono text-[0.6875rem] text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </span>
    </div>
  )
}

export function TokenUsagePanel({
  stats,
  sessionTokens,
  onClose,
}: TokenUsagePanelProps) {
  const promptShare =
    stats && stats.totalTokens > 0
      ? (stats.promptTokens / stats.totalTokens) * 100
      : 0

  return (
    <aside
      aria-label="Uso de tokens"
      className="flex h-full flex-col bg-sidebar"
    >
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3">
        <h2 className="font-mono text-sm font-semibold tracking-tight">
          Uso de tokens
        </h2>
        {onClose ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="xl:hidden"
          >
            <X aria-hidden="true" />
            <span className="sr-only">Cerrar panel de uso de tokens</span>
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-border px-4 py-4">
          <span className="label-mono text-muted-foreground">
            Total de la sesión
          </span>
          <p className="mt-1.5 font-mono text-3xl leading-none tracking-tight">
            {formatNumber(sessionTokens)}
            <span className="ml-1 font-mono text-xs text-muted-foreground">
              tok
            </span>
          </p>
        </div>

        {stats ? (
          <>
            <div className="px-4 py-4">
              <span className="label-mono text-muted-foreground">
                Composición de la última respuesta
              </span>
              <div
                className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${formatNumber(stats.promptTokens)} tokens de prompt y ${formatNumber(stats.completionTokens)} tokens de completado`}
              >
                <span
                  className="bg-chart-3"
                  style={{ width: `${promptShare}%` }}
                />
                <span
                  className="bg-primary"
                  style={{ width: `${100 - promptShare}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-4 font-mono text-[0.6875rem] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-chart-3"
                  />
                  Prompt
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-primary"
                  />
                  Completado
                </span>
              </div>
            </div>

            <Metric
              label="Tokens del prompt"
              value={formatNumber(stats.promptTokens)}
              unit="tok"
            />
            <Metric
              label="Tokens de completado"
              value={formatNumber(stats.completionTokens)}
              unit="tok"
            />
            <Metric
              label="Total de la respuesta"
              value={formatNumber(stats.totalTokens)}
              unit="tok"
              emphasis
            />
            <Metric
              label="Tiempo de respuesta"
              value={formatDuration(stats.responseTimeMs)}
            />
            <Metric
              label="Tokens por segundo"
              value={stats.tokensPerSecond.toFixed(1)}
              unit="tok/s"
            />
            <Metric label="Modelo" value={getModelLabel(stats.model)} />
            <div className="flex flex-col gap-1 px-4 py-3">
              <span className="label-mono text-muted-foreground">
                Proveedor
              </span>
              <span className="font-mono text-sm text-foreground">
                {stats.provider === 'groq' ? 'Groq API' : 'Vercel AI Gateway'}
              </span>
              {stats.providerModelId ? (
                <span className="font-mono text-[0.6875rem] break-all text-muted-foreground">
                  {stats.providerModelId}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <p className="px-4 py-6 text-sm leading-relaxed text-muted-foreground">
            Envía un mensaje para ver las métricas de la respuesta: tokens,
            latencia y velocidad de generación.
          </p>
        )}
      </div>
    </aside>
  )
}
