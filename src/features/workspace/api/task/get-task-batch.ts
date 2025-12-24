import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { AssignedTask } from '@/types'
import { workspaceKeys } from './workspace-keys'

const BASE_URL = 'https://openpecha-annotation-tool-dev.web.app/api'

const getAssignedTask = async (username: string): Promise<AssignedTask | null> => {
  const response = await fetch(`${BASE_URL}/tasks/assign/${username}`, {
    headers: { 'accept': 'application/json' }
  })
  
  if (!response.ok) {
    if (response.status === 404) return null // No task available
    throw new Error('Failed to fetch task')
  }
  
  return response.json()
}

export const useGetAssignedTask = (username?: string) => {
  return useQuery({
    queryKey: workspaceKeys.assignedTask(username ?? ''),
    queryFn: () => getAssignedTask(username!),
    enabled: !!username,
    staleTime: 0, // Always fetch fresh
    retry: 1,
  })
}

export const useRefreshAssignedTask = () => {
  const queryClient = useQueryClient()

  return (username: string) => {
    queryClient.invalidateQueries({
      queryKey: workspaceKeys.assignedTask(username),
    })
  }
}

