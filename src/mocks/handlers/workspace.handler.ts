import { http, HttpResponse, delay } from 'msw'
import { tasks, users } from '../db'
import { TaskStatus, TaskAction, UserRole } from '@/types'
import type { TaskHistoryEntry, Task } from '@/types'

const BATCH_SIZE = 10

// Helper to create a history entry
const createHistoryEntry = (
  action: TaskAction,
  userId: string,
  userName: string,
  previousStatus: TaskStatus | undefined,
  newStatus: TaskStatus,
  comment?: string
): TaskHistoryEntry => ({
  id: crypto.randomUUID(),
  action,
  userId,
  userName,
  timestamp: new Date(),
  previousStatus,
  newStatus,
  comment,
})

// Helper to find user by ID
const findUserById = (id: string) => users.find(u => u.id === id)

export const workspaceHandlers = [

  // POST /tasks/:taskId/submit - Submit task for review
  http.post('/api/tasks/:taskId/submit', async ({ params, request }) => {
    await delay(300)

    const { taskId } = params
    const body = await request.json() as { correctedText: string; userId: string }
    const { correctedText, userId } = body

    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = tasks[taskIndex]
    const user = findUserById(userId)
    
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 400 })
    }

    if (task.assignedTo !== userId) {
      return HttpResponse.json({ error: 'You are not assigned to this task' }, { status: 403 })
    }

    if (task.status !== TaskStatus.InProgress && task.status !== TaskStatus.Rejected) {
      return HttpResponse.json({ error: 'Task cannot be submitted in current status' }, { status: 400 })
    }

    const previousStatus = task.status
    task.correctedText = correctedText
    task.status = TaskStatus.AwaitingReview
    task.updatedAt = new Date()
    task.history.push(
      createHistoryEntry(TaskAction.Submitted, user.id ?? '', user.username ?? '', previousStatus, task.status)
    )

    return HttpResponse.json(task)
  }),

  // POST /api/tasks/:taskId/reject - Reject task
  http.post('/api/tasks/:taskId/reject', async ({ params, request }) => {
    await delay(300)

    const { taskId } = params
    const body = await request.json() as { reviewerId: string; comment: string }
    const { reviewerId, comment } = body

    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = tasks[taskIndex]
    const reviewer = findUserById(reviewerId)
    
    if (!reviewer) {
      return HttpResponse.json({ error: 'Reviewer not found' }, { status: 400 })
    }

    if (task.status !== TaskStatus.InReview && task.status !== TaskStatus.FinalReview) {
      return HttpResponse.json({ error: 'Task cannot be rejected in current status' }, { status: 400 })
    }

    // Verify the reviewer is assigned
    if (task.status === TaskStatus.InReview && task.reviewerId !== reviewerId) {
      return HttpResponse.json({ error: 'You are not the reviewer for this task' }, { status: 403 })
    }
    if (task.status === TaskStatus.FinalReview && task.finalReviewerId !== reviewerId) {
      return HttpResponse.json({ error: 'You are not the final reviewer for this task' }, { status: 403 })
    }

    const previousStatus = task.status
    const action = task.status === TaskStatus.FinalReview ? TaskAction.FinalRejected : TaskAction.Rejected
    task.status = TaskStatus.Rejected
    task.updatedAt = new Date()
    task.history.push(
      createHistoryEntry(action, reviewer.id ?? '', reviewer.username ?? '', previousStatus, task.status, comment)
    )

    return HttpResponse.json(task)
  }),

  // GET /api/tasks/batch/:userId - Get batch of tasks for user
  http.get('/api/tasks/batch/:userId', async ({ params, request }) => {
    await delay(200)

    const { userId } = params
    const url = new URL(request.url)
    const groupId = url.searchParams.get('groupId')
    
    const user = findUserById(String(userId))
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let eligibleTasks: Task[] = []

    // Filter tasks based on role
    if (user.role === UserRole.Annotator) {
      // Get tasks assigned to user or pending in user's group
      eligibleTasks = tasks.filter(t => {
        // Already assigned to this user
        if (t.assignedTo === userId && 
            (t.status === TaskStatus.InProgress || t.status === TaskStatus.Rejected || t.status === TaskStatus.Completed)) {
          return true
        }
        // Pending tasks from user's group that can be assigned
        if (t.status === TaskStatus.Pending && 
            (!groupId || t.groupId === groupId) &&
            !t.assignedTo) {
          return true
        }
        return false
      })
    } else if (user.role === UserRole.Reviewer) {
      eligibleTasks = tasks.filter(t => 
        t.status === TaskStatus.AwaitingReview ||
        (t.status === TaskStatus.InReview && t.reviewerId === userId)
      )
    } else if (user.role === UserRole.FinalReviewer) {
      eligibleTasks = tasks.filter(t => 
        t.status === TaskStatus.AwaitingFinalReview ||
        (t.status === TaskStatus.FinalReview && t.finalReviewerId === userId)
      )
    }

    // Sort by updated date
    eligibleTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    // Take only BATCH_SIZE tasks
    const batchTasks = eligibleTasks.slice(0, BATCH_SIZE)
    
    // Auto-assign pending tasks to annotator
    if (user.role === UserRole.Annotator) {
      batchTasks.forEach(task => {
        if (task.status === TaskStatus.Pending && !task.assignedTo) {
          task.assignedTo = String(userId)
          task.assignedToName = user.username ?? ''
          task.status = TaskStatus.InProgress
          task.updatedAt = new Date()
          task.history.push(
            createHistoryEntry(TaskAction.Assigned, user.id ?? '', user.username ?? '', TaskStatus.Pending, TaskStatus.InProgress)
          )
        }
      })
    }

    return HttpResponse.json({
      tasks: batchTasks,
      hasMore: eligibleTasks.length > BATCH_SIZE,
      totalInPool: eligibleTasks.length,
    })
  }),

  // GET /api/tasks/assign/{username}
  http.get('/api/tasks/assign/:username', async ({ params }) => {
    await delay(300)

    const { username } = params
    const user = findUserById(String(username))
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return HttpResponse.json([])
  }),
  
  // POST /api/tasks/:taskId/trash - Mark task as trashed
  http.post('/api/tasks/:taskId/trash', async ({ params, request }) => {
    await delay(300)

    const { taskId } = params
    const body = await request.json() as { userId: string }
    const { userId } = body

    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = tasks[taskIndex]
    const user = findUserById(userId)
    
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 400 })
    }

    // Mark as trashed (we'll use a special status or remove from active tasks)
    const previousStatus = task.status
    task.status = TaskStatus.Pending // Reset to pending, removing assignment
    task.assignedTo = undefined
    task.assignedToName = undefined
    task.correctedText = ''
    task.updatedAt = new Date()
    task.history.push(
      createHistoryEntry(TaskAction.Reassigned, user.id ?? '', user.username ?? '', previousStatus, TaskStatus.Pending, 'Task marked as trash')
    )

    return HttpResponse.json(task)
  }),

  // POST /api/tasks/:taskId/reopen - Reopen a completed/submitted task
  http.post('/api/tasks/:taskId/reopen', async ({ params, request }) => {
    await delay(300)

    const { taskId } = params
    const body = await request.json() as { userId: string }
    const { userId } = body

    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = tasks[taskIndex]
    const user = findUserById(userId)
    
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 400 })
    }

    // Reopen task - set back to in progress
    const previousStatus = task.status
    task.status = TaskStatus.InProgress
    task.updatedAt = new Date()
    task.history.push(
      createHistoryEntry(TaskAction.Started, user.id ?? '', user.username ?? '', previousStatus, TaskStatus.InProgress, 'Task reopened for editing')
    )

    return HttpResponse.json(task)
  }),
]

