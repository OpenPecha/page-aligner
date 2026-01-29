import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'

import { workspaceKeys } from './workspace-keys'

interface DeleteTextContentParams {
  task_id: string
  text_id: string
  user_id: string
}

interface DeleteTextContentResponse {
  success: boolean
}

const deleteTextContent = async (
  params: DeleteTextContentParams
): Promise<DeleteTextContentResponse> => {
  return apiClient.delete(
    `/tasks/${APPLICATION_NAME}/tasks/${params.task_id}/texts/${params.text_id}`,
    {
      data: { user_id: params.user_id },
    }
  )
}

export const useDeleteTextContent = (user_id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTextContent,
    onSuccess: () => {
      if (user_id) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(user_id) })
      }
    },
  })
}
