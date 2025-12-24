export const taskKeys = {
  all: ['tasks'] as const,
  list: (username: string) => ['tasks', 'list', username] as const,
  detail: (id: string) => ['tasks', id] as const,
};

