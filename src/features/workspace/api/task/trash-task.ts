import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'
import { apiClient } from '@/lib/axios'

interface TrashTaskRequest {
  task_id: string
  username: string
  submit: boolean
}

interface TrashTaskResponse {
  success: boolean
  message?: string
}

const trashTask = async (params: TrashTaskRequest): Promise<TrashTaskResponse> => {
  return apiClient.post(`/tasks/submit/${params.task_id}`, {
    username: params.username,
    submit: false,
  })
}

export const useTrashTask = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: trashTask,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(username) })
      }
    },
  })
}
