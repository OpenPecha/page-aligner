import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { groupKeys } from './group-keys';

interface DeleteGroupResponse {
  success: boolean;
  message?: string;
}

const deleteGroup = async (name: string): Promise<DeleteGroupResponse> => {
  return apiClient.delete(`/group/${name}`);
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
};

