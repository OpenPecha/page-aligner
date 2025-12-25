export const STATE_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  annotating: { label: 'Annotating', variant: 'default' },
  submitted: { label: 'Submitted', variant: 'secondary' },
  reviewing: { label: 'In Review', variant: 'outline' },
  completed: { label: 'Completed', variant: 'secondary' },
  trashed: { label: 'Trashed', variant: 'destructive' },
}

