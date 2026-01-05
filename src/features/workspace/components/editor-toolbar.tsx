import { useCallback } from 'react'
import { Eraser, Type, ALargeSmall, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useUIStore, type EditorFontFamily, type EditorFontSize } from '@/store/use-ui-store'

// Font family options with display names
const FONT_FAMILIES: { value: EditorFontFamily; label: string; fontClass: string }[] = [
  { value: 'monlam', label: 'Monlam OuChan', fontClass: "font-['monlam']" },
  { value: 'monlam-2', label: 'Monlam TBslim', fontClass: "font-['monlam-2']" },
]

// Font size options
const FONT_SIZES: EditorFontSize[] = [14, 16, 18, 20, 24, 28, 32]

type EditorToolbarProps = {
  onClear: () => void
  onRestoreOriginal: () => void
  hasContent: boolean
  hasOriginalContent: boolean
  isDisabled?: boolean
}

export function EditorToolbar({
  onClear,
  onRestoreOriginal,
  hasContent,
  hasOriginalContent,
  isDisabled = false,
}: EditorToolbarProps) {
  const {
    editorFontFamily,
    editorFontSize,
    setEditorFontFamily,
    setEditorFontSize,
    addToast,
  } = useUIStore()

  const handleFontFamilyChange = useCallback(
    (value: string) => {
      setEditorFontFamily(value as EditorFontFamily)
    },
    [setEditorFontFamily]
  )

  const handleFontSizeChange = useCallback(
    (value: string) => {
      setEditorFontSize(Number(value) as EditorFontSize)
    },
    [setEditorFontSize]
  )

  const handleClear = useCallback(() => {
    // Trigger the clear action
    onClear()

    // Show toast with undo option
    addToast({
      title: 'Transcription cleared',
      description: 'The text area has been cleared',
      variant: 'default',
      action: {
        label: 'Undo',
        onClick: () => {
          onRestoreOriginal()
        },
      },
    })
  }, [onClear, onRestoreOriginal, addToast])

  const currentFontLabel = FONT_FAMILIES.find((f) => f.value === editorFontFamily)?.label ?? 'Monlam'

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border-b border-border">
      {/* Font Family Selector */}
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Select
          value={editorFontFamily}
          onValueChange={handleFontFamilyChange}
          disabled={isDisabled}
        >
          <SelectTrigger
            className="h-8 w-[140px] text-xs border-input/50 bg-background/50 hover:bg-background focus:ring-1"
            aria-label="Select font family"
          >
            <SelectValue placeholder="Font">
              <span className={cn("text-xs", FONT_FAMILIES.find(f => f.value === editorFontFamily)?.fontClass)}>
                {currentFontLabel}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem
                key={font.value}
                value={font.value}
                className={cn('text-sm', font.fontClass)}
              >
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size Selector */}
      <div className="flex items-center gap-2">
        <ALargeSmall className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Select
          value={editorFontSize.toString()}
          onValueChange={handleFontSizeChange}
          disabled={isDisabled}
        >
          <SelectTrigger
            className="h-8 w-[80px] text-xs border-input/50 bg-background/50 hover:bg-background focus:ring-1"
            aria-label="Select font size"
          >
            <SelectValue placeholder="Size">{editorFontSize}px</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={size.toString()} className="text-sm">
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Restore Original Button */}
      {hasOriginalContent && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRestoreOriginal}
            disabled={isDisabled}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Restore original OCR text"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Restore Original
          </Button>
          <Separator orientation="vertical" className="h-5" />
        </>
      )}

      {/* Clear Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClear}
        disabled={isDisabled || !hasContent}
        className={cn(
          'h-8 px-3 text-xs transition-colors',
          hasContent
            ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
            : 'text-muted-foreground/50'
        )}
        aria-label="Clear transcription text"
      >
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
    </div>
  )
}

