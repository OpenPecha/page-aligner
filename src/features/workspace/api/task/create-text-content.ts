import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'

import { workspaceKeys } from './workspace-keys'

interface CreateTextContentParams {
  task_id: string
  user_id: string
  order: number
}

interface CreateTextContentResponse {
  text_id: string
  order: number
  content: string | null
}

const createTextContent = async (
  params: CreateTextContentParams
): Promise<CreateTextContentResponse> => {
  return apiClient.post(
    `/tasks/${APPLICATION_NAME}/tasks/${params.task_id}/texts`,
    {
      user_id: params.user_id,
      order: params.order,
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
