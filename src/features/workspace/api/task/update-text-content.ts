import { useMutation } from '@tanstack/react-query'

import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'

interface UpdateTextContentParams {
  task_id: string
  text_id: string
  user_id: string
  new_content: string
}

const updateTextContent = async (
  params: UpdateTextContentParams
): Promise<string> => {
  return apiClient.put(
    `/tasks/${APPLICATION_NAME}/tasks/${params.task_id}/texts/${params.text_id}`,
    {
      user_id: params.user_id,
      new_content: params.new_content,
    }
  )
}

export const useUpdateTextContent = () => {
  return useMutation({
    mutationFn: updateTextContent,
  })
}
