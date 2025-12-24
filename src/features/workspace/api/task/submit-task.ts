import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'

const BASE_URL = 'https://openpecha-annotation-tool-dev.web.app/api'

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
  const response = await fetch(`${BASE_URL}/tasks/submit/${params.task_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({username: params.username, transcript: params.transcript, submit: params.submit}),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Submit failed' }))
    throw new Error(error.message || 'Submit failed')
  }

  return response.json()
}

export const useSubmitTask = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitTask,
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(username) })
      }
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
    },
  })
}

