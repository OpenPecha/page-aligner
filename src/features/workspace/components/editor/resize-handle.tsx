import { cn } from '@/lib/utils'

interface ResizeHandleProps {
  imageWidthPercent: number
  isResizing: boolean
  onResizeStart: (e: React.MouseEvent) => void
}

/**
 * Vertical resize handle for adjusting the image/transcription column split.
 * Positioned between the two columns and shows visual feedback on hover/drag.
 */
export function ResizeHandle({ imageWidthPercent, isResizing, onResizeStart }: ResizeHandleProps) {
  return (
    <div
      className={cn(
        'group absolute bottom-0 top-0 z-40 w-4 cursor-col-resize',
        isResizing && 'bg-primary/20'
      )}
      style={{ left: `calc(${imageWidthPercent}% - 8px)` }}
      onMouseDown={onResizeStart}
    >
      {/* Visible resize bar - full height */}
      <div
        className={cn(
          'absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 transition-colors',
          isResizing ? 'bg-primary' : 'bg-border group-hover:bg-primary/70'
        )}
      />
    </div>
  )
}
