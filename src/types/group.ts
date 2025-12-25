import type { User } from './user'

// Group interface
export interface Group {
  id: string
  name: string
  description: string
}

// Group with associated users
export interface GroupWithUsers extends Group {
  users: User[]
}

// Request payload for creating groups
export interface GroupRequest {
  name: string
  description: string
}

// Request payload for updating groups
export interface GroupUpdateRequest {
  new_name?: string
  new_description?: string
}

