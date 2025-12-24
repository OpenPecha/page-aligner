import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { AssignedTask } from '@/types';
import { taskKeys } from './task-keys';

const getTask = async (username: string): Promise<AssignedTask | null> => {
  return apiClient.get(`/tasks/assign/${username}`);
};

export const useGetTask = (username: string) => {
  return useQuery({
    queryKey: taskKeys.list(username),
    queryFn: () => getTask(username),
    retry: 1,
  });
};

