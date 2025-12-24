import { http, HttpResponse, delay } from 'msw'
import { tasks, generateTaskId, findTaskById, deleteTaskById, addTask, groups } from '../db'
import { TaskStatus, TaskAction } from '@/types'
import type { Task, TaskUploadPayload, BulkCreateTasksResponse } from '@/types'

export const taskHandlers = [
  // GET /api/tasks - List all tasks with optional filters
  http.get('/api/tasks', async ({ request }) => {
    await delay(200)

    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status')
    const groupId = url.searchParams.get('groupId')
    const search = url.searchParams.get('search')

    let result = [...tasks]

    if (statusFilter) {
      const statuses = statusFilter.split(',') as TaskStatus[]
      result = result.filter(t => statuses.includes(t.status))
    }

    if (groupId) {
      result = result.filter(t => t.groupId === groupId)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(t =>
        t.noisyText.toLowerCase().includes(searchLower) ||
        t.correctedText.toLowerCase().includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower) ||
        t.batchName?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by updatedAt descending
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return HttpResponse.json(result)
  }),

  // GET /api/tasks/:taskId - Get single task
  http.get('/api/tasks/:taskId', async ({ params }) => {
    await delay(200)

    const { taskId } = params
    const task = findTaskById(taskId as string)

    if (!task) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(task)
  }),

  // POST /api/tasks/bulk - Bulk create tasks from JSON upload
  http.post('/api/tasks/bulk', async ({ request }) => {
    await delay(500)

    const body = await request.json() as { payload: TaskUploadPayload; groupId: string, batchName: string }
    const { payload, groupId, batchName } = body

    // Validate group exists
    const group = groups.find(g => g.id === groupId)
    if (!group) {
      return HttpResponse.json(
        { error: 'Group not found' },
        { status: 400 }
      )
    }

    // Validate payload structure
    if (!payload || !Array.isArray(payload.data)) {
      return HttpResponse.json(
        { error: 'Invalid payload structure. Expected { data: [...] }' },
        { status: 400 }
      )
    }

    const createdTasks: Task[] = []
    const errors: Array<{ index: number; message: string }> = []

    for (let i = 0; i < payload.data.length; i++) {
      const item = payload.data[i]

      // Validate required fields
      if (!item.image_url) {
        errors.push({ index: i, message: 'Missing image_url' })
        continue
      }
      if (!item.transcription) {
        errors.push({ index: i, message: 'Missing transcription' })
        continue
      }

      // Validate URL format
      try {
        new URL(item.image_url)
      } catch {
        errors.push({ index: i, message: 'Invalid image_url format' })
        continue
      }

      const newTask: Task = {
        id: generateTaskId(),
        imageUrl: item.image_url,
        imageId: item.image_id || undefined,
        imageOrder: item.image_order ? parseInt(item.image_order, 10) : i + 1,
        noisyText: item.transcription,
        correctedText: '',
        status: TaskStatus.Pending,
        groupId,
        batchName,
        history: [
          {
            id: crypto.randomUUID(),
            action: TaskAction.Created,
            userId: 'user_admin_001',
            userName: 'Alex Admin',
            timestamp: new Date(),
            newStatus: TaskStatus.Pending,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      addTask(newTask)
      createdTasks.push(newTask)
    }

    const response: BulkCreateTasksResponse = {
      success: errors.length === 0,
      created: createdTasks.length,
      failed: errors.length,
      errors,
      tasks: createdTasks,
    }

    return HttpResponse.json(response, { status: 201 })
  }),

  // DELETE /api/tasks/:taskId - Delete a task
  http.delete('/api/tasks/:taskId', async ({ params }) => {
    await delay(300)

    const { taskId } = params
    const task = findTaskById(taskId as string)

    if (!task) {
      return HttpResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    deleteTaskById(taskId as string)

    return HttpResponse.json({
      success: true,
      message: 'Task deleted successfully',
    })
  }),
]

