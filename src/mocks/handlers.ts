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

  // PUT - Update text content for a block
  http.put(`${BASE_URL}/tasks/${APPLICATION_NAME}/text/:textId`, async ({ params, request }) => {
    await delay(200) // Simulate network latency

    const { textId } = params
    const body = await request.json() as { user_id: string; content: string }

    console.log(`[MSW] Updating text block ${textId}:`, body.content.slice(0, 50) + '...')

    // Update the text in our mock store
    for (const [, task] of tasksStore) {
      const text = task.texts.find((t) => t.text_id === textId)
      if (text) {
        text.content = body.content
        break
      }
    }

    return HttpResponse.json({ success: true, message: 'Text content updated' })
  }),

  // POST - Create new text content for a task
  http.post(`${BASE_URL}/tasks/${APPLICATION_NAME}/task/:taskId/text`, async ({ params, request }) => {
    await delay(300) // Simulate network latency

    const { taskId } = params
    const body = await request.json() as { user_id: string; order: number; content: string }

    // Generate a server ID for the new text
    const newTextId = `srv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    console.log(`[MSW] Creating text block for task ${taskId}:`, {
      text_id: newTextId,
      order: body.order,
      content: body.content.slice(0, 50) + '...',
    })

    // Add the new text to our mock store
    for (const [userId, task] of tasksStore) {
      if (task.task_id === taskId || userId === 'u2') {
        task.texts.push({
          text_id: newTextId,
          order: body.order,
          page_number: Math.ceil(body.order), // Use order as page number for mock
          content: body.content,
        })
        // Sort by order
        task.texts.sort((a, b) => a.order - b.order)
        break
      }
    }

    return HttpResponse.json({
      text_id: newTextId,
      order: body.order,
      content: body.content,
    })
  }),
]
