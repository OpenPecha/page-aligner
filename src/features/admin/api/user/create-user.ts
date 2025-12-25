import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { type CreateUserDTO, type User } from '@/types';
import { userKeys } from './user-keys';

const createUser = async (data: CreateUserDTO): Promise<User> => {
  return apiClient.post('/user/', data);
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};