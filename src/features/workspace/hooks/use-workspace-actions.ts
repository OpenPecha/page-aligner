import { useAuth } from '@/features/auth'
import {
  useGetAssignedTask,
  useSubmitTask,
  useTrashTask,
  useApproveTask,
  useRejectTask,
} from '../api/task'
import { useEditorStore } from '@/store/use-editor-store'

/**
 * Custom hook that encapsulates all workspace task actions.
 * Combines task queries and mutations with transcript text generation.
 */
export function useWorkspaceActions() {
  const { currentUser } = useAuth()
  const userId = currentUser?.id

  const { data: task, isLoading, error } = useGetAssignedTask(userId)
  const submitTask = useSubmitTask(userId)
  const trashTask = useTrashTask(userId)
  const approveTask = useApproveTask(userId)
  const rejectTask = useRejectTask(userId)

  const texts = useEditorStore((state) => state.texts)

  // Combine all text blocks for submission
  const getTranscriptText = () => {
    return texts.map((t) => t.text).join('\n---PAGE_BREAK---\n')
  }

  const handleSubmit = async () => {
    if (!task || !userId) return
    await submitTask.mutateAsync({
      task_id: task.task_id,
      user_id: userId,
      transcript: getTranscriptText(),
      submit: true,
    })
  }

  const handleTrash = async () => {
    if (!task || !userId) return
    await trashTask.mutateAsync({
      task_id: task.task_id,
      user_id: userId,
      submit: false,
    })
  }

  const handleApprove = async () => {
    if (!task || !userId) return
    await approveTask.mutateAsync({
      task_id: task.task_id,
      user_id: userId,
      transcript: getTranscriptText(),
      approve: true,
    })
  }

  const handleReject = async () => {
    if (!task || !userId) return
    await rejectTask.mutateAsync({
      task_id: task.task_id,
      user_id: userId,
      transcript: getTranscriptText(),
      reject: true,
    })
  }

  const isSubmitting =
    submitTask.isPending ||
    trashTask.isPending ||
    approveTask.isPending ||
    rejectTask.isPending

  return {
    task,
    isLoading,
    error,
    isSubmitting,
    currentUser,
    handleSubmit,
    handleTrash,
    handleApprove,
    handleReject,
  }
}
