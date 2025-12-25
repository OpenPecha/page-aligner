import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'
import { apiClient } from '@/lib/axios'

interface SubmitTaskParams {
  task_id: string
  username: string
  transcript: string
  submit: boolean
}

interface SubmitTaskResponse {
  success: boolean
  message?: string
}

const submitTask = async (params: SubmitTaskParams): Promise<SubmitTaskResponse> => {
  return apiClient.post(`/tasks/submit/${params.task_id}`, {
    username: params.username,
    transcript: params.transcript,
    submit: params.submit,
  })
}

export const useSubmitTask = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitTask,
    onSuccess: () => {
      if (username) {
        queryClient.refetchQueries({ queryKey: workspaceKeys.assignedTask(username) })
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(username) })
      }
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}
