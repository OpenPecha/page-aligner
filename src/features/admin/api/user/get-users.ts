import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { type User, type PaginatedResponse, type UserFilters } from '@/types'
import { userKeys } from './user-keys'

const getUsers = async (filters: UserFilters): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams()
  
  if (filters.search) params.append('search', filters.search)
  if (filters.role) params.append('role', filters.role)
  if (filters.groupId) params.append('groupId', filters.groupId)
  if (filters.page) params.append('page', String(filters.page))
  if (filters.limit) params.append('limit', String(filters.limit))

  const queryString = params.toString()
  return apiClient.get(`/user/${queryString ? `?${queryString}` : ''}`)
}

export const useGetUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    retry: 1,
  })
}