import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'

import { workspaceKeys } from './workspace-keys'

interface UpdateTextContentParams {
  text_id: string
  user_id: string
  content: string
}

interface UpdateTextContentResponse {
  success: boolean
  message?: string
}

const updateTextContent = async (
  params: UpdateTextContentParams
): Promise<UpdateTextContentResponse> => {
  return apiClient.put(`/tasks/${APPLICATION_NAME}/text/${params.text_id}`, {
    user_id: params.user_id,
    content: params.content,
  })
}

export const useUpdateTextContent = (user_id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTextContent,
    onSuccess: () => {
      if (user_id) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(user_id) })
      }
    },
  })
}
