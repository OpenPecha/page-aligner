import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { type GroupUpdateRequest, type Group } from '@/types';
import { groupKeys } from './group-keys';

interface UpdateGroupParams {
  name: string;
  data: GroupUpdateRequest;
}

const updateGroup = async ({ name, data }: UpdateGroupParams): Promise<Group> => {
  return apiClient.put(`/group/${name}`, data);
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGroup,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.name) });
    },
  });
};

