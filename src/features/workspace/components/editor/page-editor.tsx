import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router'
import { List, useDynamicRowHeight } from 'react-window'
import type { ListImperativeAPI } from 'react-window'
import { EditorRowWrapper, type EditorRowProps, type AlignedRow } from './editor-row-wrapper'
import { ResizeHandle } from './resize-handle'
import { WorkspaceHeader } from '../header'
import { useEditorStore, useUIStore } from '@/store/use-editor-store'
import { useColumnResize, useKeyboardShortcuts } from '../../hooks'
import { useUpdateTextContent, useCreateTextContent, useDeleteTextContent } from '../../api/task'
import { useAuth } from '@/features/auth'
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
  const [savingBlocks, setSavingBlocks] = useState<Set<string>>(new Set())
  // Track specific block action: { blockId, action: 'addAbove' | 'addBelow' | 'delete' }
  const [blockAction, setBlockAction] = useState<{ blockId: string; action: 'addAbove' | 'addBelow' | 'delete' } | null>(null)

  const listRef = useRef<ListImperativeAPI>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dynamicRowHeight = useDynamicRowHeight({ defaultRowHeight: DEFAULT_ROW_HEIGHT })

  // Refs for debounce timers and rollback values (per block)
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const originalTextRef = useRef<Map<string, string>>(new Map())

  // Get task_id from URL params
  const { taskId } = useParams<{ taskId: string }>()

  // Resolved task ID (from URL params or task object)
  const taskIdToUse = taskId || task.task_id

  // Auth and API mutations
  const { currentUser } = useAuth()
  const updateTextContent = useUpdateTextContent()
  const createTextContent = useCreateTextContent(currentUser?.id)
  const deleteTextContent = useDeleteTextContent(currentUser?.id)

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
  const getOrderForAbove = useEditorStore((state) => state.getOrderForAbove)
  const getOrderForBelow = useEditorStore((state) => state.getOrderForBelow)
  const markBlockClean = useEditorStore((state) => state.markBlockClean)

  // UI store selectors
  const editorFontFamily = useUIStore((state) => state.editorFontFamily)
  const editorFontSize = useUIStore((state) => state.editorFontSize)

  const fontFamily = FONT_FAMILY_MAP[editorFontFamily as keyof typeof FONT_FAMILY_MAP] || 'monlam-3'

  // Initialize texts only when task ID changes (not on every refetch)
  // This prevents overwriting local edits during debounced saves
  useEffect(() => {
    if (task?.texts) {
      const mappedTexts = task.texts.map((text) => ({
        id: text.text_id,
        order: text.order,
        text: text.content ?? '',
      }))
      initializeTexts(mappedTexts)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.task_id])

  // Delete block - API first, then store
  const handleDelete = useCallback(
    async (id: string) => {
      if (!currentUser?.id || blockAction || !taskIdToUse) return

      setBlockAction({ blockId: id, action: 'delete' })

      try {
        await deleteTextContent.mutateAsync({
          task_id: taskIdToUse,
          text_id: id,
          user_id: currentUser.id,
        })

        // Remove block from store on success
        deleteBlock(id)
      } catch (error) {
        console.error('Failed to delete text block:', error)
      } finally {
        setBlockAction(null)
      }
    },
    [currentUser?.id, blockAction, taskIdToUse, deleteTextContent, deleteBlock]
  )

  // Debounced save handler with API call and rollback on failure
  const handleTextChange = useCallback(
    (id: string, text: string) => {
      // Store original text for rollback (only if not already stored)
      if (!originalTextRef.current.has(id)) {
        const currentTexts = useEditorStore.getState().texts
        const currentBlock = currentTexts.find((t) => t.id === id)
        if (currentBlock) {
          originalTextRef.current.set(id, currentBlock.text)
        }
      }

      // Optimistic update to Zustand store (marks block as dirty)
      updateBlockText(id, text)

      // Clear existing timer for this block
      const existingTimer = debounceTimersRef.current.get(id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set new debounced save timer
      const timer = setTimeout(async () => {
        if (!currentUser?.id) return

        // Get current block data from store (avoid stale closure)
        const currentTexts = useEditorStore.getState().texts
        const currentBlock = currentTexts.find((t) => t.id === id)
        if (!currentBlock) return

        // Show saving state
        setSavingBlocks((prev) => new Set(prev).add(id))

        try {
          await updateTextContent.mutateAsync({
            task_id: taskIdToUse,
            text_id: currentBlock.id,
            user_id: currentUser.id,
            new_content: text,
          })

          // Success: update original text reference and clear dirty state
          originalTextRef.current.set(currentBlock.id, text)
          markBlockClean(currentBlock.id)
        } catch (error) {
          // Failure: rollback to original text
          const originalText = originalTextRef.current.get(currentBlock.id)
          if (originalText !== undefined) {
            updateBlockText(currentBlock.id, originalText)
            // Clear dirty state since text now matches server
            markBlockClean(currentBlock.id)
          }
          console.error('Failed to save text block:', error)
        } finally {
          // Clear saving state
          setSavingBlocks((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
          debounceTimersRef.current.delete(id)
        }
      }, SAVE_DEBOUNCE_MS)

      debounceTimersRef.current.set(id, timer)
    },
    [currentUser?.id, taskIdToUse, updateBlockText, updateTextContent, markBlockClean]
  )

  // Cleanup debounce timers on unmount
  useEffect(() => {
    const timers = debounceTimersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  // Handle block focus
  const handleBlockFocus = (index: number, id: string) => {
    setActiveBlock(id)
    listRef.current?.scrollToRow({ index, align: 'smart' })
  }

  // Add block above - API first, then store
  const handleAddAbove = useCallback(
    async (id: string) => {
      if (!currentUser?.id || blockAction) return

      const order = getOrderForAbove(id)
      if (order === null) return

      setBlockAction({ blockId: id, action: 'addAbove' })

      try {
        const response = await createTextContent.mutateAsync({
          task_id: taskIdToUse,
          user_id: currentUser.id,
          order,
        })

        // Add block to store with server ID
        addBlockAbove(id, {
          id: response.text_id,
          order: response.order,
          text: response.content ?? '',
        })
      } catch (error) {
        console.error('Failed to create text block:', error)
      } finally {
        setBlockAction(null)
      }
    },
    [currentUser?.id, blockAction, taskIdToUse, getOrderForAbove, createTextContent, addBlockAbove]
  )

  // Add block below - API first, then store
  const handleAddBelow = useCallback(
    async (id: string) => {
      if (!currentUser?.id || blockAction) return

      const order = getOrderForBelow(id)
      if (order === null) return

      setBlockAction({ blockId: id, action: 'addBelow' })

      try {
        const response = await createTextContent.mutateAsync({
          task_id: taskIdToUse,
          user_id: currentUser.id,
          order,
        })

        // Add block to store with server ID
        addBlockBelow(id, {
          id: response.text_id,
          order: response.order,
          text: response.content ?? '',
        })
      } catch (error) {
        console.error('Failed to create text block:', error)
      } finally {
        setBlockAction(null)
      }
    },
    [currentUser?.id, blockAction, taskIdToUse, getOrderForBelow, createTextContent, addBlockBelow]
  )

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
    blockAction,
    canDelete: texts.length > 1,
    onFocus: handleBlockFocus,
    onTextChange: handleTextChange,
    onAddAbove: handleAddAbove,
    onAddBelow: handleAddBelow,
    onDelete: handleDelete,
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

    </div>
  )
}
