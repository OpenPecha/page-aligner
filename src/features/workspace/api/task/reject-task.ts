import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'
import { apiClient } from '@/lib/axios'

interface RejectTaskParams {
  task_id: string
  username: string
  transcript: string
  reject: boolean
}

interface RejectTaskResponse {
  success: boolean
  message?: string
}

const rejectTask = async (params: RejectTaskParams): Promise<RejectTaskResponse> => {
  return apiClient.post(`/tasks/submit/${params.task_id}`, {
    username: params.username,
    transcript: params.transcript,
    submit: false,
  })
}

export const useRejectTask = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectTask,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(username) })
      }
    },
  })
}
