export const workspaceKeys = {
  all: ['workspace'] as const,
  assignedTask: (username: string) => ['workspace', 'assigned-task', username] as const,
  taskBatch: (userId: string, groupId?: string) => ['workspace', 'task-batch', userId, groupId] as const,
  annotatorTasks: (userId: string) => ['workspace', 'annotator-tasks', userId] as const,
  reviewerTasks: (userId: string) => ['workspace', 'reviewer-tasks', userId] as const,
  finalReviewerTasks: (userId: string) => ['workspace', 'final-reviewer-tasks', userId] as const,
};

