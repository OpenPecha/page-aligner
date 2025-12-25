import { useState, useCallback, useRef, useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import { GripHorizontal, Send, Trash2, XCircle } from 'lucide-react'
import { ImageCanvas } from './image-canvas'
import { WorkspaceSidebar } from './workspace-sidebar'
import { TrashConfirmationDialog } from './trash-confirmation-dialog'
import { UnsavedChangesDialog } from './unsaved-changes-dialog'
import { EditorOverlay } from './editor-overlay'
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

export function WorkspaceEditor() {
  const { currentUser } = useAuth()
  const { addToast } = useUIStore()

  // State
  const [text, setText] = useState('')
  const [initialText, setInitialText] = useState('')
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
  } = useGetAssignedTask(currentUser?.username)

  const submitTask = useSubmitTask(currentUser?.username)
  const trashTask = useTrashTask(currentUser?.username)
  const approveTask = useApproveTask(currentUser?.username)
  const rejectTask = useRejectTask(currentUser?.username)

  // Derived states
  const hasUnsavedChanges = text !== initialText
  const canEdit = task?.state === 'annotating' || task?.state === 'reviewing'
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
  } else if (!task && currentTaskId !== null) {
    setCurrentTaskId(null)
    setText('')
    setInitialText('')
  }

  // Submit handler
  const handleSubmit = useCallback(() => {
    if (!task || !currentUser) return

    submitTask.mutate(
      { task_id: task.task_id, username: currentUser.username!, transcript: text, submit: true },
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
      { task_id: task.task_id, username: currentUser.username!, submit: false },
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
      { task_id: task.task_id, username: currentUser.username!, transcript: text, approve: true },
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
      { task_id: task.task_id, username: currentUser.username!, transcript: text, reject: true },
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

  // Split pane handlers
  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const container = e.currentTarget as HTMLElement
      const rect = container.getBoundingClientRect()
      const position = ((e.clientY - rect.top) / rect.height) * 100
      setSplitPosition(Math.max(20, Math.min(80, position)))
    },
    [isDragging]
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
          className="relative flex-1 flex flex-col overflow-hidden"
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
            className="overflow-hidden border-b border-border"
            style={{ height: `${splitPosition}%` }}
          >
            <ImageCanvas imageUrl={task.task_url} />
          </div>

          {/* Resize Handle */}
          <div
            className={cn(
              'flex h-2 cursor-row-resize items-center justify-center bg-border hover:bg-primary/50 transition-colors',
              isDragging && 'bg-primary'
            )}
            onMouseDown={handleMouseDown}
          >
            <GripHorizontal className="h-3 w-5 text-muted-foreground" />
          </div>

          {/* Text Editor Panel */}
          <div
            className="overflow-hidden bg-sky-100 dark:bg-sky-900/20"
            style={{ height: `${100 - splitPosition}%` }}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              readOnly={!canEdit || showOverlay}
              placeholder="Begin typing or editing..."
              className={cn(
                'h-full w-full resize-none bg-transparent p-5 font-monlam text-sm leading-7',
                'text-foreground placeholder:text-muted-foreground/50',
                'focus:outline-none focus:ring-0',
                (!canEdit || showOverlay) && 'cursor-default opacity-80'
              )}
              style={{
                fontFamily: "Monlam",
                fontSize: "1.3rem",
                lineHeight: 1.5,
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
          disabled={showOverlay || !canEdit}
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
