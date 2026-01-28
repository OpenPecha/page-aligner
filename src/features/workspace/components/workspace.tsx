import { useWorkspaceActions } from '../hooks'
import { WorkspaceLoading } from './workspace-loading'
import { WorkspaceError } from './workspace-error'
import { WorkspaceEmpty } from './workspace-empty'
import { PageEditor } from './editor'

/**
 * Main Workspace component that orchestrates task loading and rendering.
 * Handles loading, error, and empty states before rendering the page editor.
 */
export function Workspace() {
  const {
    task,
    isLoading,
    error,
    isSubmitting,
    currentUser,
    handleSubmit,
    handleTrash,
    handleApprove,
    handleReject,
  } = useWorkspaceActions()

  if (isLoading) {
    return <WorkspaceLoading />
  }

  if (error) {
    return <WorkspaceError message={error.message} />
  }

  if (!task) {
    return <WorkspaceEmpty />
  }

  return (
    <PageEditor
      task={task}
      userRole={currentUser?.role}
      onSubmit={handleSubmit}
      onTrash={handleTrash}
      onApprove={handleApprove}
      onReject={handleReject}
      isSubmitting={isSubmitting}
    />
  )
}
