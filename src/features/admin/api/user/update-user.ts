import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { type User, type UpdateUserDTO } from '@/types'
import { userKeys } from './user-keys'
import { groupKeys } from '../group/group-keys'

interface UpdateUserParams {
  username: string
  data: UpdateUserDTO
}

const updateUser = async ({ username, data }: UpdateUserParams): Promise<User> => {
  return apiClient.put(`/user/${username}`, data)
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate all user queries to refresh the list
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      // Also invalidate group queries to refresh user lists in groups
      queryClient.invalidateQueries({ queryKey: groupKeys.all })
    },
  })
}

