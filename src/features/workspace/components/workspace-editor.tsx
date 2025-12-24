import { useState, useCallback, useRef } from 'react'
import { GripHorizontal, Send, Trash2 } from 'lucide-react'
import { ImageCanvas } from './image-canvas'
import { WorkspaceSidebar } from './workspace-sidebar'
import { TrashConfirmationDialog } from './trash-confirmation-dialog'
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
  console.log('currentUser', currentUser?.role)
  console.log("role", UserRole.Reviewer)
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
    refetch,
  } = useGetAssignedTask(currentUser?.username)

  const submitTask = useSubmitTask(currentUser?.username)
  const trashTask = useTrashTask(currentUser?.username)
  const approveTask = useApproveTask(currentUser?.username)
  const rejectTask = useRejectTask(currentUser?.username)
  const hasUnsavedChanges = text !== initialText
  const canEdit = task?.state === 'annotating' || task?.state === 'reviewing' || task?.state === 'finalising'

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
      { task_id: task.task_id, username: currentUser.username, transcript: text, submit: true },
      {
        onSuccess: () => {
          addToast({
            title: 'Task submitted',
            description: 'Your work has been submitted for review',
            variant: 'success',
          })
          setInitialText(text)
          // Fetch next task
          refetch()
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
  }, [task, currentUser, text, submitTask, addToast, refetch])

  // Trash handler
  const handleTrash = useCallback(() => {
    if (!task || !currentUser) return

    trashTask.mutate(
      { task_id: task.task_id, username: currentUser.username, submit: false },
      {
        onSuccess: () => {
          setTrashDialogOpen(false)
          addToast({ title: 'Task marked as trash', variant: 'default' })
          // Fetch next task
          refetch()
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
  }, [task, currentUser, trashTask, addToast, refetch])

  // Approve handler
  const handleApprove = useCallback(() => {
    if (!task || !currentUser) return

    approveTask.mutate(
      { task_id: task.task_id, username: currentUser.username, transcript: text, approve: true },
      {
        onSuccess: () => {
          addToast({
            title: 'Task approved',
            description: 'The task has been approved successfully',
            variant: 'success',
          })
          setInitialText(text)
          refetch()
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
  }, [task, currentUser, text, approveTask, addToast, refetch])

  // Reject handler
  const handleReject = useCallback(() => {
    if (!task || !currentUser) return

    rejectTask.mutate(
      { task_id: task.task_id, username: currentUser.username, transcript: text, reject: true },
      {
        onSuccess: () => {
          addToast({ title: 'Task rejected', variant: 'default' })
          refetch()
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
  }, [task, currentUser, text, rejectTask, addToast, refetch])

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

  // Character and word count
  const charCount = text.length
  const wordCount = text.split(/\s+/).filter(Boolean).length

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-60 border-r border-sidebar-border bg-sidebar">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 flex flex-col">
          <Skeleton className="h-full w-full" />
        </div>
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
          isLoading={isLoading}
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
        isLoading={isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Content */}
      <main className="flex-1 ml-60 flex flex-col">
        {/* Split Pane Container */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
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
              readOnly={!canEdit}
              placeholder="Begin typing or editing..."
              className={cn(
                'h-full w-full resize-none bg-transparent p-5 font-monlam text-sm leading-7',
                'text-foreground placeholder:text-muted-foreground/50',
                'focus:outline-none focus:ring-0',
                !canEdit && 'cursor-default opacity-80'
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
        <footer className="flex items-center justify-between border-t border-border bg-card px-6 py-3">
          {/* Character/Word Count */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {charCount} <span className="opacity-60">char</span>
            </span>
            <span className="w-px h-4 bg-border" />
            <span>
              {wordCount} <span className="opacity-60">words</span>
            </span>
            {hasUnsavedChanges && (
              <>
                <span className="w-px h-4 bg-border" />
                <span className="text-warning">Unsaved changes</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {currentUser?.role === UserRole.Annotator && 
            <>
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={submitTask.isPending || !canEdit}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitTask.isPending ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setTrashDialogOpen(true)}
              disabled={trashTask.isPending || !canEdit}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Trash
            </Button>
            </>
            }
            {(currentUser?.role === UserRole.Reviewer || currentUser?.role === UserRole.FinalReviewer) && 
            <>
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={approveTask.isPending || !canEdit}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitTask.isPending ? 'Submitting...' : 'Approve'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectTask.isPending || !canEdit}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reject
            </Button>
            </>
            }
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
    </div>
  )
}
