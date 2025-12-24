import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import type { Task } from '@/types';
import { taskKeys } from './task-keys';

const getTasks = async (username: string): Promise<Task[]> => {
  return apiClient.get(`/tasks/assign/${username}`);
};

export const useGetTasks = (username: string) => {
  console.log("username", username)
  return useQuery({
    queryKey: taskKeys.list(username),
    queryFn: () => getTasks(username),
    retry: 1,
  });
};

