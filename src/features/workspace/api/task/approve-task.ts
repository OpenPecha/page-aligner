import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'

const BASE_URL = 'https://openpecha-annotation-tool-dev.web.app/api'

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
  const response = await fetch(`${BASE_URL}/tasks/submit/${params.task_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({username: params.username,transcript: params.transcript, submit: params.approve}),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Approve failed' }))
    throw new Error(error.message || 'Approve failed')
  }

  return response.json()
}

export const useApproveTask = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveTask,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(username) })
      }
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

