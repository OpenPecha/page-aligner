import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorOverlayProps {
  show: boolean
  message?: string
  variant?: 'loading' | 'disabled'
}

export function EditorOverlay({ 
  show, 
  message = 'Loading next task...', 
  variant = 'loading' 
}: EditorOverlayProps) {
  if (!show) return null

  return (
    <div 
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center',
        'bg-background/60 backdrop-blur-[2px]',
        'transition-opacity duration-200'
      )}
    >
      {variant === 'loading' && (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-card/90 px-6 py-4 shadow-lg border border-border">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      )}
    </div>
  )
}

