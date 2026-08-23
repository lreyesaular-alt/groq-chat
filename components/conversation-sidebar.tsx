'use client'

import { MessageSquare, Plus, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatNumber, formatRelativeDate } from '@/lib/storage'
import type { Conversation } from '@/lib/types'
import { cn } from '@/lib/utils'

type ConversationSidebarProps = {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onClose?: () => void
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onClose,
}: ConversationSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20"
          />
          <span className="font-mono text-sm font-semibold tracking-tight">
            Groq Chat
          </span>
        </div>
        {onClose ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X aria-hidden="true" />
            <span className="sr-only">Cerrar historial</span>
          </Button>
        ) : null}
      </div>

      <div className="px-3 py-3">
        <Button onClick={onCreate} className="w-full justify-start" size="lg">
          <Plus data-icon="inline-start" aria-hidden="true" />
          Nueva conversación
        </Button>
      </div>

      <div className="label-mono px-4 pb-2 text-muted-foreground">
        Historial
      </div>

      <nav
        aria-label="Historial de conversaciones"
        className="flex-1 overflow-y-auto px-2 pb-4"
      >
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-sm leading-relaxed text-muted-foreground">
            Todavía no hay conversaciones. Empieza una nueva para verla aquí.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeId
              return (
                <li key={conversation.id} className="group/item relative">
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'flex w-full flex-col gap-1 rounded-md px-2.5 py-2 pr-9 text-left transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/60',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare
                        aria-hidden="true"
                        className={cn(
                          'size-3.5 shrink-0',
                          isActive ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                      <span className="truncate text-sm">
                        {conversation.title}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 pl-5.5 font-mono text-[0.6875rem] text-muted-foreground">
                      <span>{formatRelativeDate(conversation.updatedAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {formatNumber(conversation.totalTokens)} tok
                      </span>
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(conversation.id)}
                    className="absolute top-2 right-1.5 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                  >
                    <Trash2 aria-hidden="true" />
                    <span className="sr-only">
                      Eliminar «{conversation.title}»
                    </span>
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </nav>
    </div>
  )
}
