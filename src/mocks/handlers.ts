import { http, HttpResponse, delay } from 'msw'
import type { AssignedTask } from '@/types'
import { APPLICATION_NAME } from '@/lib/constant'

const BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

// Mock data
import { assignedTask } from './data'

// In-memory store for tasks (to simulate persistence)
const tasksStore = new Map<string, AssignedTask>([
  ['WFBlbkoomMMVESPIccX2s', assignedTask],
  ['u2', assignedTask], // Dev user for testing
])

export const handlers = [
  // GET - Fetch assigned task for a user
  http.get(`${BASE_URL}/tasks/${APPLICATION_NAME}/assign/:userId`, async ({ params }) => {
    await delay(300) // Simulate network latency

    const { userId } = params
    const task = tasksStore.get(userId as string)

    if (!task) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(task)
  }),
]
