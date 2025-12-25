export const groupKeys = {
  all: ['groups'] as const,
  detail: (name: string) => ['groups', name] as const,
  withUsers: (name: string) => ['groups', name, 'users'] as const,
};