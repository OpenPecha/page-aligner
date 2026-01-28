import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'

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
    new_content: params.content,
  })
}

export const useUpdateTextContent = () => {
  return useMutation({
    mutationFn: updateTextContent,
  })
}
