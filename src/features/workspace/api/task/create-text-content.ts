import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'

import { workspaceKeys } from './workspace-keys'

interface CreateTextContentParams {
  task_id: string
  user_id: string
  type: 'before' | 'after'
  text_id: string
  count: number
}

interface CreateTextContentResponse {
  created_count: number
  task_id: string
}

const createTextContent = async (
  params: CreateTextContentParams
): Promise<CreateTextContentResponse> => {
  return apiClient.post(
    `/tasks/${APPLICATION_NAME}/tasks/${params.task_id}/texts`,
    {
      user_id: params.user_id,
      type: params.type,
      text_id: params.text_id,
      count: params.count,
    }
  )
}

export const useCreateTextContent = (user_id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTextContent,
    onSuccess: () => {
      if (user_id) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(user_id) })
      }
    },
  })
}
