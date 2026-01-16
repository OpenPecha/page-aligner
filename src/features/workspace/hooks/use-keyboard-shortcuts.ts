import { useEffect } from 'react'
import { useEditorStore } from '@/store/use-editor-store'

/**
 * Custom hook for workspace keyboard shortcuts.
 * Currently handles undo/redo with Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z.
 */
export function useKeyboardShortcuts() {
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const canUndo = useEditorStore((state) => state.canUndo)
  const canRedo = useEditorStore((state) => state.canRedo)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          if (canRedo()) redo()
        } else {
          e.preventDefault()
          if (canUndo()) undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo])
}
