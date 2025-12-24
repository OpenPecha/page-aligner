import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'

const BASE_URL = 'https://openpecha-annotation-tool-dev.web.app/api'

interface TrashTaskRequest {
  taskId: string
  username: string
}

interface TrashTaskResponse {
  success: boolean
  message?: string
}

const trashTask = async ({ taskId }: TrashTaskRequest): Promise<TrashTaskResponse> => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/trash`, {
    method: 'POST',
    headers: { 'accept': 'application/json' },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Trash failed' }))
    throw new Error(error.message || 'Trash failed')
  }

  return response.json()
}

export const useTrashTask = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: trashTask,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(username) })
      }
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

