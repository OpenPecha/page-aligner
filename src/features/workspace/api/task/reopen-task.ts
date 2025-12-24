import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import type { Task } from '@/types'
import { workspaceKeys } from './workspace-keys'

interface ReopenTaskRequest {
  taskId: string
  userId: string
}

const reopenTask = async ({ taskId, userId }: ReopenTaskRequest): Promise<Task> => {
  return apiClient.post(`/tasks/${taskId}/reopen`, { userId })
}

export const useReopenTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reopenTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

