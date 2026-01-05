import { useState, useCallback, useRef, useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import { GripHorizontal, GripVertical, Send, Trash2, XCircle } from 'lucide-react'
import { ImageCanvas } from './image-canvas'
import { WorkspaceSidebar } from './workspace-sidebar'
import { TrashConfirmationDialog } from './trash-confirmation-dialog'
import { UnsavedChangesDialog } from './unsaved-changes-dialog'
import { EditorOverlay } from './editor-overlay'
import { EditorToolbar } from './editor-toolbar'
import { EmptyTasksState } from './empty-tasks-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/store/use-ui-store'
import {
  useGetAssignedTask,
  useSubmitTask,
  useTrashTask,
  useApproveTask,
  useRejectTask,
} from '../api'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

// Font family CSS mapping
const FONT_FAMILY_MAP = {
  monlam: 'monlam',
  'monlam-2': 'monlam-2',
} as const

export function WorkspaceEditor() {
  const { currentUser } = useAuth()
  const { addToast, editorFontFamily, editorFontSize } = useUIStore()

  // State
  const [text, setText] = useState('')
  const [initialText, setInitialText] = useState('')
  const [originalOcrText, setOriginalOcrText] = useState('')
  const [splitPosition, setSplitPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [trashDialogOpen, setTrashDialogOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // API hooks
  const {
    data: task,
    isLoading,
    isFetching,
    refetch,
  } = useGetAssignedTask(currentUser?.id)

  const submitTask = useSubmitTask(currentUser?.id)
  const trashTask = useTrashTask(currentUser?.id)
  const approveTask = useApproveTask(currentUser?.id)
  const rejectTask = useRejectTask(currentUser?.id)

  // Derived states
  const hasUnsavedChanges = text !== initialText
  const canEdit = task?.state === 'annotating' || task?.state === 'reviewing' || task?.state === 'finalising'
  const isMutating = submitTask.isPending || trashTask.isPending || approveTask.isPending || rejectTask.isPending
  const isLoadingNextTask = isFetching && !isLoading
  const showOverlay = isLoadingNextTask || isMutating

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(hasUnsavedChanges)

  // Derive dialog open state from blocker
  const isBlockerActive = blocker.state === 'blocked'

  // Browser beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Track task ID to detect task changes
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  // Load task text when task changes
  if (task && task.task_id !== currentTaskId) {
    setCurrentTaskId(task.task_id)
    setText(task.task_transcript)
    setInitialText(task.task_transcript)
    setOriginalOcrText(task.task_transcript)
  } else if (!task && currentTaskId !== null) {
    setCurrentTaskId(null)
    setText('')
    setInitialText('')
    setOriginalOcrText('')
  }

  // Clear handler for toolbar
  const handleClear = useCallback(() => {
    setText('')
  }, [])

  // Restore original OCR text handler
  const handleRestoreOriginal = useCallback(() => {
    setText(originalOcrText)
  }, [originalOcrText])

  // Submit handler
  const handleSubmit = useCallback(() => {
    if (!task || !currentUser) return

    submitTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, transcript: text, submit: true },
      {
        onSuccess: () => {
          addToast({
            title: 'Task submitted',
            description: 'Your work has been submitted for review',
            variant: 'success',
          })
          setInitialText(text)
        },
        onError: (error: Error) => {
          addToast({
            title: 'Submit failed',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }, [task, currentUser, text, submitTask, addToast])

  // Trash handler
  const handleTrash = useCallback(() => {
    if (!task || !currentUser) return

    trashTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, submit: false },
      {
        onSuccess: () => {
          setTrashDialogOpen(false)
          addToast({ title: 'Task marked as trash', variant: 'default' })
        },
        onError: (error: Error) => {
          addToast({
            title: 'Failed to trash task',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }, [task, currentUser, trashTask, addToast])

  // Approve handler
  const handleApprove = useCallback(() => {
    if (!task || !currentUser) return

    approveTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, transcript: text, approve: true },
      {
        onSuccess: () => {
          addToast({
            title: 'Task approved',
            description: 'The task has been approved successfully',
            variant: 'success',
          })
          setInitialText(text)
        },
        onError: (error: Error) => {
          addToast({
            title: 'Failed to approve task',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }, [task, currentUser, text, approveTask, addToast])

  // Reject handler
  const handleReject = useCallback(() => {
    if (!task || !currentUser) return

    rejectTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, transcript: text, reject: true },
      {
        onSuccess: () => {
          addToast({ title: 'Task rejected', variant: 'default' })
        },
        onError: (error: Error) => {
          addToast({
            title: 'Failed to reject task',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }, [task, currentUser, text, rejectTask, addToast])

  // Derive layout direction from orientation
  // Portrait images → horizontal split (side-by-side)
  // Landscape images → vertical split (stacked)
  const isHorizontalLayout = task?.orientation === 'portrait'

  // Track orientation changes to reset split position
  const [lastOrientation, setLastOrientation] = useState<string | undefined>(undefined)
  
  // Reset split position to 50% when orientation changes
  if (task?.orientation !== lastOrientation) {
    setLastOrientation(task?.orientation)
    setSplitPosition(50)
  }

  // Split pane handlers
  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const container = e.currentTarget as HTMLElement
      const rect = container.getBoundingClientRect()

      // Calculate position based on layout direction
      const position = isHorizontalLayout
        ? ((e.clientX - rect.left) / rect.width) * 100
        : ((e.clientY - rect.top) / rect.height) * 100

      setSplitPosition(Math.max(20, Math.min(80, position)))
    },
    [isDragging, isHorizontalLayout]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Loading state - keep sidebar visible, only skeleton main area
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <WorkspaceSidebar
          task={null}
          onRefresh={() => refetch()}
          isLoading={true}
        />
        <main className="flex-1 ml-60 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-full w-full m-4 rounded-lg" />
          </div>
        </main>
      </div>
    )
  }

  // Empty state - no task available
  if (!task) {
    return (
      <div className="flex h-screen">
        <WorkspaceSidebar
          task={null}
          onRefresh={() => refetch()}
          isLoading={isLoading || isFetching}
        />
        <main className="flex-1 ml-60">
          <EmptyTasksState
            onRefresh={() => refetch()}
            isLoading={isLoading}
            message="No tasks available. Click refresh to check for new tasks."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <WorkspaceSidebar
        task={task}
        onRefresh={() => refetch()}
        isLoading={isFetching}
      />

      {/* Main Content */}
      <main className="flex-1 ml-60 flex flex-col">
        {/* Split Pane Container */}
        <div
          className={cn(
            'relative flex-1 flex overflow-hidden',
            isHorizontalLayout ? 'flex-row' : 'flex-col'
          )}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Loading/Mutation Overlay */}
          <EditorOverlay
            show={showOverlay}
            message={isMutating ? 'Processing...' : 'Loading next task...'}
          />

          {/* Image Panel */}
          <div
            className={cn(
              'overflow-hidden flex-shrink-0',
              isHorizontalLayout ? 'border-r border-border h-full' : 'border-b border-border w-full'
            )}
            style={
              isHorizontalLayout
                ? { width: `calc(${splitPosition}% - 6px)` }
                : { height: `${splitPosition}%` }
            }
          >
            <ImageCanvas imageUrl={task.task_url} />
          </div>

          {/* Resize Handle */}
          <div
            className={cn(
              'flex-shrink-0 flex items-center justify-center bg-border/80 transition-colors select-none',
              isHorizontalLayout
                ? 'w-3 cursor-col-resize hover:bg-primary/40'
                : 'h-2 cursor-row-resize hover:bg-primary/50',
              isDragging && 'bg-primary/60'
            )}
            onMouseDown={handleMouseDown}
          >
            {isHorizontalLayout ? (
              <GripVertical className="h-6 w-4 text-muted-foreground/70" />
            ) : (
              <GripHorizontal className="h-3 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Text Editor Panel */}
          <div
            className={cn(
              'overflow-hidden bg-gradient-to-br from-sky-50/80 to-cyan-50/60 dark:from-sky-900/20 dark:to-cyan-900/10 flex-1 flex flex-col',
              isHorizontalLayout ? 'h-full' : 'w-full'
            )}
          >
            {/* Editor Toolbar */}
            <EditorToolbar
              onClear={handleClear}
              onRestoreOriginal={handleRestoreOriginal}
              hasContent={text.length > 0}
              hasOriginalContent={originalOcrText.length > 0 && text !== originalOcrText}
              isDisabled={!canEdit || showOverlay}
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              readOnly={!canEdit || showOverlay}
              placeholder="Begin typing or editing..."
              className={cn(
                'flex-1 w-full resize-none bg-transparent p-5',
                'text-foreground placeholder:text-muted-foreground/50',
                'focus:outline-none focus:ring-0',
                'transition-all duration-200',
                (!canEdit || showOverlay) && 'cursor-default opacity-80'
              )}
              style={{
                fontFamily: FONT_FAMILY_MAP[editorFontFamily],
                fontSize: `${editorFontSize}px`,
                lineHeight: 1.6,
              }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="grid grid-cols-3 items-center border-t border-border bg-card px-6 py-3">
          {/* Left Section: Status (Pinned to start) */}
          <div className="flex items-center text-sm text-muted-foreground">
            {hasUnsavedChanges && (
              <span className="text-warning animate-pulse font-medium">
                Unsaved changes
              </span>
            )}
          </div>

          {/* Center Section: Actions (Perfectly centered) */}
          <div className="flex items-center justify-center gap-3">
            {currentUser?.role === UserRole.Annotator && (
              <>
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={showOverlay || !canEdit || text.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitTask.isPending ? 'Submitting...' : 'Submit'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setTrashDialogOpen(true)}
                  disabled={showOverlay || !canEdit}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Trash
                </Button>
              </>
            )}

            {(currentUser?.role === UserRole.Reviewer || currentUser?.role === UserRole.FinalReviewer) && (
              <>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={showOverlay || !canEdit}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {approveTask.isPending ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={showOverlay || !canEdit}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>

          {/* Right Section: Empty Spacer (Ensures center stays center) */}
          <div className="flex justify-end">
            {/* You can put word counts or page numbers here later */}
          </div>
        </footer>
      </main>

      {/* Trash Dialog */}
      <TrashConfirmationDialog
        open={trashDialogOpen}
        onOpenChange={setTrashDialogOpen}
        onConfirm={handleTrash}
        onCancel={() => setTrashDialogOpen(false)}
        isLoading={trashTask.isPending}
        taskName={task.task_name}
      />

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={isBlockerActive}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.()
        }}
        onDiscard={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  )
}
