import { useQuery } from '@tanstack/react-query'
import type { AssignedTask } from '@/types'
import { workspaceKeys } from './workspace-keys'
import { apiClient } from '@/lib/axios'

const getAssignedTask = async (username: string): Promise<AssignedTask | null> => {
  try {
    return await apiClient.get(`/tasks/assign/${username}`)
  } catch (error) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { status: number } }
      if (axiosError.response?.status === 404) return null
    }
    throw new Error('Failed to fetch task')
  }
}

export const useGetAssignedTask = (username?: string) => {
  return useQuery({
    queryKey: workspaceKeys.assignedTask(username ?? ''),
    queryFn: () => getAssignedTask(username!),
    enabled: !!username,
    staleTime: 0,
    retry: 1,
  })
}
