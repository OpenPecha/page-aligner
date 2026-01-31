import { useEffect, useRef, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface EditorNavigationProps {
  /** Current active row index (0-based), null if none active */
  currentRowIndex: number | null
  /** Total number of rows */
  totalRows: number
  /** Callback to scroll to a specific row (0-based index) */
  onScrollToRow: (index: number) => void
  /** Controlled state for go-to dialog */
  isGoToOpen?: boolean
  /** Callback when go-to dialog open state changes */
  onGoToOpenChange?: (open: boolean) => void
  /** Optional className for positioning */
  className?: string
}

/**
 * Floating navigation component for large document navigation.
 * Provides scroll to top/bottom, page jumps, and go-to-row functionality.
 * Collapsed by default, expands on hover or when go-to panel is open.
 */
export function EditorNavigation({
  currentRowIndex,
  totalRows,
  onScrollToRow,
  isGoToOpen: controlledIsGoToOpen,
  onGoToOpenChange,
  className,
}: EditorNavigationProps) {
  // Support both controlled and uncontrolled modes
  const [internalIsGoToOpen, setInternalIsGoToOpen] = useState(false)
  const isGoToOpen = controlledIsGoToOpen ?? internalIsGoToOpen

  // Hover state for expand/collapse
  const [isHovered, setIsHovered] = useState(false)

  // Expand navigation when hovered or go-to panel is open
  const isExpanded = isHovered || isGoToOpen
  
  const [goToValue, setGoToValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Unified setter for controlled/uncontrolled state
  const updateGoToOpen = (open: boolean) => {
    if (onGoToOpenChange) {
      onGoToOpenChange(open)
    } else {
      setInternalIsGoToOpen(open)
    }
  }

  // Display row number (1-based for user-facing)
  const displayCurrentRow = currentRowIndex !== null ? currentRowIndex + 1 : 1

  // Calculate if we're near top or bottom
  const isNearTop = currentRowIndex !== null && currentRowIndex < 5
  const isNearBottom = currentRowIndex !== null && currentRowIndex >= totalRows - 5

  // Page size for page up/down navigation
  const pageSize = Math.min(10, Math.floor(totalRows / 10) || 1)

  // Focus input when go-to panel opens
  useEffect(() => {
    if (isGoToOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isGoToOpen])

  // Handle scroll to top
  const handleScrollToTop = () => {
    onScrollToRow(0)
  }

  // Handle scroll to bottom
  const handleScrollToBottom = () => {
    onScrollToRow(totalRows - 1)
  }

  // Handle page up (scroll up by pageSize)
  const handlePageUp = () => {
    const currentIndex = currentRowIndex ?? 0
    const newIndex = Math.max(0, currentIndex - pageSize)
    onScrollToRow(newIndex)
  }

  // Handle page down (scroll down by pageSize)
  const handlePageDown = () => {
    const currentIndex = currentRowIndex ?? 0
    const newIndex = Math.min(totalRows - 1, currentIndex + pageSize)
    onScrollToRow(newIndex)
  }

  // Handle go-to-row submission
  const handleGoToSubmit = () => {
    const rowNumber = parseInt(goToValue, 10)
    if (!isNaN(rowNumber) && rowNumber >= 1 && rowNumber <= totalRows) {
      onScrollToRow(rowNumber - 1) // Convert to 0-based index
      closeGoTo()
    }
  }

  // Handle input key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleGoToSubmit()
    } else if (e.key === 'Escape') {
      closeGoTo()
    }
  }

  // Open go-to panel with initial value
  const openGoTo = () => {
    setGoToValue(displayCurrentRow.toString())
    updateGoToOpen(true)
  }

  // Close go-to panel
  const closeGoTo = () => {
    updateGoToOpen(false)
    setGoToValue('')
  }

  // Toggle go-to panel
  const toggleGoTo = () => {
    if (isGoToOpen) {
      closeGoTo()
    } else {
      openGoTo()
    }
  }

  // Don't render if there are very few rows
  if (totalRows <= 10) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Go-to-row panel */}
      {isGoToOpen && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
          <span className="text-xs text-muted-foreground">Go to:</span>
          <Input
            ref={inputRef}
            type="number"
            min={1}
            max={totalRows}
            value={goToValue}
            onChange={(e) => setGoToValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-20 text-center text-sm"
            placeholder={displayCurrentRow.toString()}
          />
          <span className="text-xs text-muted-foreground">/ {totalRows}</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleGoToSubmit}
            className="h-8 px-3"
          >
            Go
          </Button>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col gap-1 rounded-lg border border-border bg-background/95 p-1.5 shadow-lg backdrop-blur-sm transition-all duration-200">
        {/* Scroll to top - visible when expanded */}
        {isExpanded && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleScrollToTop}
            disabled={isNearTop}
            className="h-8 w-8"
            title="Scroll to top"
          >
            <ChevronsUp className="h-4 w-4" />
          </Button>
        )}

        {/* Page up - visible when expanded */}
        {isExpanded && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePageUp}
            disabled={isNearTop}
            className="h-8 w-8"
            title={`Page up (${pageSize} rows)`}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}

        {/* Row indicator / Go-to trigger - always visible */}
        <button
          onClick={toggleGoTo}
          className={cn(
            'flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-xs font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isGoToOpen && 'bg-accent text-accent-foreground'
          )}
          title="Go to row"
        >
          {displayCurrentRow}
        </button>

        {/* Page down - visible when expanded */}
        {isExpanded && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePageDown}
            disabled={isNearBottom}
            className="h-8 w-8"
            title={`Page down (${pageSize} rows)`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}

        {/* Scroll to bottom - visible when expanded */}
        {isExpanded && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleScrollToBottom}
            disabled={isNearBottom}
            className="h-8 w-8"
            title="Scroll to bottom"
          >
            <ChevronsDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
