import { useState, useEffect, useRef } from 'react'
import { List, useDynamicRowHeight } from 'react-window'
import type { ListImperativeAPI } from 'react-window'
import { EditorRowWrapper, type EditorRowProps, type AlignedRow } from './editor-row-wrapper'
import { ResizeHandle } from './resize-handle'
import { WorkspaceHeader } from '../header'
import { DeleteBlockDialog } from '../dialogs'
import { useEditorStore, useUIStore } from '@/store/use-editor-store'
import { useColumnResize, useKeyboardShortcuts } from '../../hooks'
import { FONT_FAMILY_MAP, DEFAULT_ROW_HEIGHT, OVERSCAN_COUNT, SAVE_DEBOUNCE_MS } from '../../constants'
import type { AssignedTask } from '@/types/task'
import type { UserRole } from '@/types/user'

interface PageEditorProps {
  task: AssignedTask
  userRole: UserRole | undefined
  onSubmit: () => void
  onTrash: () => void
  onApprove: () => void
  onReject: () => void
  isSubmitting?: boolean
}

/**
 * Main page editor component with virtualized rows for large documents.
 * Handles transcription editing, block management, and layout resizing.
 */
export function PageEditor({
  task,
  userRole,
  onSubmit,
  onTrash,
  onApprove,
  onReject,
  isSubmitting,
}: PageEditorProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blockToDelete, setBlockToDelete] = useState<{ id: string; order: number } | null>(null)
  const [savingBlocks, setSavingBlocks] = useState<Set<string>>(new Set())

  const listRef = useRef<ListImperativeAPI>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dynamicRowHeight = useDynamicRowHeight({ defaultRowHeight: DEFAULT_ROW_HEIGHT })

  // Custom hooks
  const { imageWidthPercent, isResizing, handleResizeStart } = useColumnResize()
  useKeyboardShortcuts()

  // Editor store selectors
  const initializeTexts = useEditorStore((state) => state.initializeTexts)
  const texts = useEditorStore((state) => state.texts)
  const activeBlockId = useEditorStore((state) => state.activeBlockId)
  const setActiveBlock = useEditorStore((state) => state.setActiveBlock)
  const deleteBlock = useEditorStore((state) => state.deleteBlock)
  const updateBlockText = useEditorStore((state) => state.updateBlockText)
  const addBlockAbove = useEditorStore((state) => state.addBlockAbove)
  const addBlockBelow = useEditorStore((state) => state.addBlockBelow)
  const markBlockClean = useEditorStore((state) => state.markBlockClean)

  // UI store selectors
  const editorFontFamily = useUIStore((state) => state.editorFontFamily)
  const editorFontSize = useUIStore((state) => state.editorFontSize)

  const fontFamily = FONT_FAMILY_MAP[editorFontFamily as keyof typeof FONT_FAMILY_MAP] || 'monlam-3'

  // Initialize texts when task changes
  // Map API TaskText to internal EditorText format
  useEffect(() => {
    if (task?.texts) {
      const mappedTexts = task.texts.map((text) => ({
        id: text.text_id,
        order: text.order,
        text: text.content ?? '',
      }))
      initializeTexts(mappedTexts)
    }
  }, [task?.task_id, task?.texts, initializeTexts])

  // Delete confirmation
  const handleDeleteRequest = (id: string) => {
    const block = texts.find((t) => t.id === id)
    if (block) {
      setBlockToDelete({ id, order: block.order })
      setDeleteDialogOpen(true)
    }
  }

  const handleConfirmDelete = () => {
    if (blockToDelete) {
      deleteBlock(blockToDelete.id)
      setBlockToDelete(null)
    }
  }

  // Debounced save handler
  const handleTextChange = (id: string, text: string) => {
    updateBlockText(id, text)

    setSavingBlocks((prev) => new Set(prev).add(id))

    setTimeout(() => {
      setSavingBlocks((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      markBlockClean(id)
    }, SAVE_DEBOUNCE_MS)
  }

  // Handle block focus
  const handleBlockFocus = (index: number, id: string) => {
    setActiveBlock(id)
    listRef.current?.scrollToRow({ index, align: 'smart' })
  }

  // Add block handlers
  const handleAddAbove = (id: string) => {
    addBlockAbove(id)
  }

  const handleAddBelow = (id: string) => {
    addBlockBelow(id)
  }

  // Create merged data for aligned rows
  const alignedData: AlignedRow[] = texts.map((editorText, index) => ({
    editorText,
    image: task.images[index],
  }))

  // Row props object passed to all virtualized rows
  const rowProps: EditorRowProps = {
    alignedData,
    activeBlockId,
    imageWidthPercent,
    fontFamily,
    fontSize: editorFontSize,
    savingBlocks,
    canDelete: texts.length > 1,
    onFocus: handleBlockFocus,
    onTextChange: handleTextChange,
    onAddAbove: handleAddAbove,
    onAddBelow: handleAddBelow,
    onDelete: handleDeleteRequest,
    dynamicRowHeight,
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Workspace Header with sticky scroll behavior */}
      <WorkspaceHeader
        task={task}
        userRole={userRole}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onTrash={onTrash}
        onApprove={onApprove}
        onReject={onReject}
        scrollContainerRef={scrollContainerRef}
      />

      {/* Main editor area with virtualized rows and vertical resize handle */}
      <div ref={scrollContainerRef} className="relative flex-1 overflow-auto" data-resize-container>
        {/* Virtualized list */}
        <div className="h-full">
          <List<EditorRowProps>
            listRef={listRef}
            rowCount={alignedData.length}
            rowHeight={dynamicRowHeight}
            rowComponent={EditorRowWrapper}
            rowProps={rowProps}
            overscanCount={OVERSCAN_COUNT}
            className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent h-full"
            style={{ height: '100%' }}
          />
        </div>

        {/* Vertical resize handle */}
        <ResizeHandle
          imageWidthPercent={imageWidthPercent}
          isResizing={isResizing}
          onResizeStart={handleResizeStart}
        />
      </div>

      {/* Delete confirmation dialog */}
      <DeleteBlockDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        blockOrder={blockToDelete?.order ?? 0}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
