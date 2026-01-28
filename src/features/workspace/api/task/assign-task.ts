import { useQuery } from '@tanstack/react-query'
import type { AssignedTask } from '@/types'
import { workspaceKeys } from './workspace-keys'
import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'

const getAssignedTask = async (userId: string): Promise<AssignedTask | null> => {
  try {
    return await apiClient.get(`/tasks/${APPLICATION_NAME}/assign/${userId}`)
  } catch (error) {
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { status: number } }
      if (axiosError.response?.status === 404) return null
    }
    throw new Error('Failed to fetch task')
  }
}

export const useGetAssignedTask = (userId?: string) => {
  return useQuery({
    queryKey: workspaceKeys.assignedTask(userId ?? ''),
    queryFn: () => getAssignedTask(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1 , // 1 minute
    retry: 1,
  })
}
