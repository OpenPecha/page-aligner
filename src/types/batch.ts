// Batch from list endpoint
export interface Batch {
  id: string
  name: string
  created: string
  group_id: string
  group_name: string
}

// Task state for batch task view
export type BatchTaskState = 'pending' | 'annotated' | 'reviewed' | 'finalised' | 'trashed'

// Individual task from batch tasks endpoint
export interface BatchTask {
  task_id: string
  task_name: string
  task_url: string
  task_transcript: string
  state: BatchTaskState
  orientation?: 'landscape' | 'portrait'
  username?: string
}

// Batch with stats from report endpoint
export interface BatchReport extends Batch {
  total_tasks: number
  pending: number
  annotated: number
  reviewed: number
  finalised: number
  trashed: number
}

// Individual task in upload JSON
export interface BatchUploadTask {
  name: string
  url: string
  transcript?: string | null
  orientation?: 'landscape' | 'portrait' | null
}

// Request payload for batch upload
export interface BatchUploadRequest {
  batch_name: string
  group_id: string
  tasks: BatchUploadTask[]
}

// Stats configuration for display
export const BATCH_STATS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-slate-100 text-slate-700',
    barColor: 'bg-slate-200',
    textColor: 'text-slate-700',
    order: 0,
  },
  annotated: {
    label: 'Annotated',
    color: 'bg-blue-100 text-blue-700',
    barColor: 'bg-indigo-500',
    textColor: 'text-white',
    order: 1,
  },
  reviewed: {
    label: 'Reviewed',
    color: 'bg-amber-100 text-amber-700',
    barColor: 'bg-cyan-500',
    textColor: 'text-white',
    order: 2,
  },
  finalised: {
    label: 'Finalised',
    color: 'bg-emerald-100 text-emerald-700',
    barColor: 'bg-emerald-500',
    textColor: 'text-white',
    order: 3,
  },
  trashed: {
    label: 'Trashed',
    color: 'bg-red-100 text-red-700',
    barColor: 'bg-rose-500',
    textColor: 'text-white',
    order: 4,
    isHatched: true,
  },
} as const

export type BatchStatKey = keyof typeof BATCH_STATS_CONFIG

// Workflow statuses (excluding trashed)
export const WORKFLOW_STATS: BatchStatKey[] = ['pending', 'annotated', 'reviewed', 'finalised']

