import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'

const BASE_URL = 'https://openpecha-annotation-tool-dev.web.app/api'

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
  const response = await fetch(`${BASE_URL}/tasks/submit/${params.task_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({username: params.username,transcript: params.transcript, submit: params.reject}),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Reject failed' }))
    throw new Error(error.message || 'Reject failed')
  }

  return response.json()
}

export const useRejectTask = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectTask,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(username) })
      }
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

