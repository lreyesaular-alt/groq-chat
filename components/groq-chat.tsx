'use client'

import { AlertTriangle, BarChart3, PanelLeft, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ConversationSidebar } from '@/components/conversation-sidebar'
import { MessageComposer } from '@/components/message-composer'
import { MessageList } from '@/components/message-list'
import { ModelSelector } from '@/components/model-selector'
import { TokenUsagePanel } from '@/components/token-usage-panel'
import { Button } from '@/components/ui/button'
import { DEFAULT_MODEL_ID, getModelLabel } from '@/lib/models'
import {
  createConversation,
  createId,
  deriveTitle,
  formatNumber,
  loadConversations,
  saveConversations,
} from '@/lib/storage'
import type {
  ChatErrorBody,
  ChatResponseBody,
  Conversation,
  Message,
  ResponseStats,
} from '@/lib/types'

export function GroqChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Rehidratación del historial guardado (sobrevive a recargas de página).
  useEffect(() => {
    const stored = loadConversations()
    if (stored.length > 0) {
      setConversations(stored)
      setActiveId(stored[0].id)
    } else {
      const conversation = createConversation()
      setConversations([conversation])
      setActiveId(conversation.id)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    saveConversations(conversations)
  }, [conversations, isHydrated])

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeId) ?? null,
    [conversations, activeId],
  )

  const sessionTokens = useMemo(
    () => conversations.reduce((total, item) => total + item.totalTokens, 0),
    [conversations],
  )

  const lastStats: ResponseStats | null = useMemo(() => {
    const messages = activeConversation?.messages ?? []
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const stats = messages[index].stats
      if (stats) return stats
    }
    return null
  }, [activeConversation])

  const modelId = activeConversation?.modelId ?? DEFAULT_MODEL_ID

  const updateConversation = useCallback(
    (id: string, updater: (conversation: Conversation) => Conversation) => {
      setConversations((previous) =>
        previous.map((item) => (item.id === id ? updater(item) : item)),
      )
    },
    [],
  )

  function handleCreate() {
    const conversation = createConversation(modelId)
    setConversations((previous) => [conversation, ...previous])
    setActiveId(conversation.id)
    setError(null)
    setIsSidebarOpen(false)
  }

  function handleSelect(id: string) {
    setActiveId(id)
    setError(null)
    setIsSidebarOpen(false)
  }

  function handleDelete(id: string) {
    setConversations((previous) => {
      const next = previous.filter((item) => item.id !== id)
      if (next.length === 0) {
        const conversation = createConversation(modelId)
        setActiveId(conversation.id)
        return [conversation]
      }
      if (id === activeId) setActiveId(next[0].id)
      return next
    })
  }

  function handleModelChange(nextModelId: string) {
    if (!activeConversation) return
    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      modelId: nextModelId,
    }))
  }

  function handleStop() {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
  }

  async function handleSend(content: string) {
    if (!activeConversation) return
    const conversationId = activeConversation.id
    const userMessage: Message = {
      id: createId(),
      role: 'user',
      content,
      createdAt: Date.now(),
    }
    const history = [...activeConversation.messages, userMessage]

    setError(null)
    setIsLoading(true)
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      title:
        conversation.messages.length === 0
          ? deriveTitle(content)
          : conversation.title,
      messages: history,
      updatedAt: Date.now(),
    }))

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          modelId: activeConversation.modelId,
          messages: history.map(({ role, content: text }) => ({
            role,
            content: text,
          })),
        }),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | ChatErrorBody
          | null
        throw new Error(body?.error ?? 'Error inesperado del servidor.')
      }

      const data = (await response.json()) as ChatResponseBody
      const assistantMessage: Message = {
        id: createId(),
        role: 'assistant',
        content: data.content,
        createdAt: Date.now(),
        stats: data.stats,
      }

      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, assistantMessage],
        totalTokens: conversation.totalTokens + data.stats.totalTokens,
        updatedAt: Date.now(),
      }))
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      console.log('[v0] Error en la petición de chat:', caught)
      setError(
        caught instanceof Error
          ? caught.message
          : 'No se pudo contactar con el servidor.',
      )
    } finally {
      abortRef.current = null
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Historial: fijo en escritorio, cajón en móvil */}
      <div className="hidden w-68 shrink-0 border-r border-sidebar-border lg:block">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      </div>

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar historial"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border shadow-xl">
            <ConversationSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              onCreate={handleCreate}
              onDelete={handleDelete}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <PanelLeft aria-hidden="true" />
              <span className="sr-only">Abrir historial</span>
            </Button>
            <h1 className="truncate text-sm font-medium">
              {activeConversation?.title ?? 'Groq Chat'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[0.6875rem] text-muted-foreground sm:inline">
              {formatNumber(sessionTokens)} tok sesión
            </span>
            <ModelSelector
              value={modelId}
              onChange={handleModelChange}
              disabled={isLoading}
            />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setIsStatsOpen(true)}
              className="xl:hidden"
            >
              <BarChart3 aria-hidden="true" />
              <span className="sr-only">Ver uso de tokens</span>
            </Button>
          </div>
        </header>

        <MessageList
          messages={activeConversation?.messages ?? []}
          isLoading={isLoading}
          modelLabel={getModelLabel(modelId)}
        />

        {error ? (
          <div
            role="alert"
            className="mx-auto flex w-full max-w-3xl items-start gap-2 px-4 pb-3 sm:px-6"
          >
            <div className="flex flex-1 items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2">
              <AlertTriangle
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p className="flex-1 text-sm leading-relaxed text-destructive">
                {error}
              </p>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setError(null)}
                className="text-destructive"
              >
                <X aria-hidden="true" />
                <span className="sr-only">Descartar error</span>
              </Button>
            </div>
          </div>
        ) : null}

        <MessageComposer
          isLoading={isLoading}
          onSend={handleSend}
          onStop={handleStop}
        />
      </main>

      {/* Panel de estadísticas: fijo en pantallas anchas, cajón en el resto */}
      <div className="hidden w-72 shrink-0 border-l border-sidebar-border xl:block">
        <TokenUsagePanel stats={lastStats} sessionTokens={sessionTokens} />
      </div>

      {isStatsOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Cerrar panel de uso de tokens"
            onClick={() => setIsStatsOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] border-l border-sidebar-border shadow-xl">
            <TokenUsagePanel
              stats={lastStats}
              sessionTokens={sessionTokens}
              onClose={() => setIsStatsOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
