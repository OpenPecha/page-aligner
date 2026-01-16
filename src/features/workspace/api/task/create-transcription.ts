import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'

import { workspaceKeys } from './workspace-keys'

interface CreateTranscriptionParams {
  task_id: string
  user_id: string
  order: number
  content: string
}

interface CreateTranscriptionResponse {
  success: boolean
  message?: string
}

const createTranscription = async (
  params: CreateTranscriptionParams
): Promise<CreateTranscriptionResponse> => {
  return apiClient.post(`/tasks/${APPLICATION_NAME}/task/${params.task_id}/text`, {
    user_id: params.user_id,
    order: params.order,
    content: params.content,
  })
}

export const useCreateTranscription = (user_id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTranscription,
    onSuccess: () => {
      if (user_id) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(user_id) })
      }
    },
  })
}
