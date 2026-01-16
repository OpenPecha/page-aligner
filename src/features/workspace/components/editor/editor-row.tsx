import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { AlertTriangle, Loader2, ArrowUpToLine, ArrowDownToLine, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useTiffImage } from '@/hooks/use-tiff-image'
import { useEditorStore } from '@/store/use-editor-store'
import { MIN_ROW_HEIGHT } from '../../constants'
import type { TaskImage } from '@/types/task'
import type { EditorText } from '@/store/use-editor-store'

export interface EditorRowHandle {
  measureHeight: () => number
}

interface EditorRowProps {
  image?: TaskImage
  editorText: EditorText
  isActive: boolean
  imageWidthPercent: number
  fontFamily: string
  fontSize: number
  isSaving?: boolean
  canDelete: boolean
  onFocus: () => void
  onTextChange: (text: string) => void
  onAddAbove: () => void
  onAddBelow: () => void
  onDelete: () => void
  onHeightChange?: () => void
}

/**
 * Single row in the editor displaying an image and its transcription side by side.
 * Supports zoom/pan on images and auto-resizing text areas.
 */
export const EditorRow = forwardRef<EditorRowHandle, EditorRowProps>(function EditorRow(
  {
    image,
    editorText,
    isActive,
    imageWidthPercent,
    fontFamily,
    fontSize,
    isSaving,
    canDelete,
    onFocus,
    onTextChange,
    onAddAbove,
    onAddBelow,
    onDelete,
    onHeightChange,
  },
  ref
) {
  const rowRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isDirty = useEditorStore((state) => state.isDirty(editorText.id))

  const { displayUrl, isConverting, error } = useTiffImage(image?.url)

  // Expose measureHeight to parent for dynamic sizing
  useImperativeHandle(ref, () => ({
    measureHeight: () => {
      return rowRef.current?.getBoundingClientRect().height ?? MIN_ROW_HEIGHT
    },
  }))

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
    onHeightChange?.()
  }, [editorText.text, fontSize, onHeightChange])

  // Focus textarea when block becomes active
  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isActive])

  const renderImage = () => {
    // No image assigned - show blank state
    if (!image) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-muted/20">
          <span className="text-xs text-muted-foreground">No image</span>
        </div>
      )
    }

    if (isConverting) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-muted/30">
          <Skeleton className="h-4/5 w-4/5" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )
    }

    if (!displayUrl) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-muted/30">
          <Skeleton className="h-4/5 w-4/5" />
        </div>
      )
    }

    return (
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.1 }}
        panning={{ disabled: false }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
          }}
          contentStyle={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={displayUrl}
            alt={`Page ${image.order}`}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        </TransformComponent>
      </TransformWrapper>
    )
  }

  return (
    <div
      ref={rowRef}
      className={`flex border-b border-border transition-colors ${
        isActive ? 'bg-accent/5' : 'hover:bg-muted/20'
      }`}
      onClick={onFocus}
      style={{ minHeight: `${MIN_ROW_HEIGHT}px` }}
    >
      {/* Image Column */}
      <div
        className="relative flex-shrink-0 overflow-hidden bg-background"
        style={{ width: `${imageWidthPercent}%` }}
      >
        {renderImage()}
        {/* Page number badge - only show when image exists */}
        {image && (
          <span className="absolute top-2 right-2 z-10 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {image.order}
          </span>
        )}
      </div>

      {/* Transcription Column */}
      <div
        className="relative flex flex-1 flex-col bg-background"
        style={{ width: `${100 - imageWidthPercent}%` }}
      >
        {/* Status badge */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          {(isDirty || isSaving) && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <span className="h-2 w-2 rounded-full bg-amber-500" title="Unsaved changes" />
              )}
            </span>
          )}
        </div>

        {/* Text content */}
        <textarea
          ref={textareaRef}
          value={editorText.text}
          onChange={(e) => onTextChange(e.target.value)}
          onFocus={onFocus}
          className="w-full flex-1 resize-none border-0 bg-transparent px-4 pb-4 pt-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: 1.8,
            minHeight: '120px',
          }}
          placeholder="Enter text..."
          spellCheck={false}
        />

        {/* Block actions - only visible when active */}
        {isActive && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-background/95 p-0.5 shadow-md backdrop-blur">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddAbove()
                }}
                title="Add block above"
              >
                <ArrowUpToLine className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddBelow()
                }}
                title="Add block below"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  title="Delete block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
