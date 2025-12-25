import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { type GroupWithUsers } from '@/types';
import { groupKeys } from './group-keys';

const getGroupWithUsers = async (name: string): Promise<GroupWithUsers> => {
  return apiClient.get(`/group/${name}/users`);
};

export const useGetGroupWithUsers = (name: string, enabled = true) => {
  return useQuery({
    queryKey: groupKeys.withUsers(name),
    queryFn: () => getGroupWithUsers(name),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
};

