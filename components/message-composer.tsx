'use client'

import { ArrowUp, Square } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

type MessageComposerProps = {
  isLoading: boolean
  onSend: (content: string) => void
  onStop: () => void
}

export function MessageComposer({
  isLoading,
  onSend,
  onStop,
}: MessageComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const content = value.trim()
    if (!content || isLoading) return
    onSend(content)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6"
    >
      <div className="flex items-end gap-2 rounded-lg border border-border bg-card p-2 shadow-sm transition-colors focus-within:border-ring">
        <label htmlFor="composer" className="sr-only">
          Escribe tu mensaje
        </label>
        <textarea
          id="composer"
          ref={textareaRef}
          rows={1}
          value={value}
          placeholder="Escribe un mensaje…"
          onChange={(event) => {
            setValue(event.target.value)
            const el = event.target
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 200)}px`
          }}
          onKeyDown={(event) => {
            const isComposing =
              event.nativeEvent.isComposing || event.keyCode === 229
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !isComposing
            ) {
              event.preventDefault()
              submit()
            }
          }}
          className="max-h-50 min-h-8 flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
        />
        {isLoading ? (
          <Button type="button" variant="secondary" size="icon" onClick={onStop}>
            <Square aria-hidden="true" />
            <span className="sr-only">Detener generación</span>
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!value.trim()}>
            <ArrowUp aria-hidden="true" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        )}
      </div>
      <p className="mt-1.5 px-1 font-mono text-[0.6875rem] text-muted-foreground">
        Enter para enviar · Shift + Enter para salto de línea
      </p>
    </form>
  )
}
