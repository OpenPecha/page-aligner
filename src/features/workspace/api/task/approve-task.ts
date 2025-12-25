import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'
import { apiClient } from '@/lib/axios'

interface ApproveTaskParams {
  task_id: string
  username: string
  transcript: string
  approve: boolean
}

interface ApproveTaskResponse {
  success: boolean
  message?: string
}

const approveTask = async (params: ApproveTaskParams): Promise<ApproveTaskResponse> => {
  return apiClient.post(`/tasks/submit/${params.task_id}`, {
    username: params.username,
    transcript: params.transcript,
    submit: params.approve,
  })
}

export const useApproveTask = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveTask,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(username) })
      }
    },
  })
}
