import type { Task, TaskHistoryEntry } from '@/types'
import { TaskStatus, TaskAction } from '@/types'

// Generate unique IDs
let idCounter = 1000
export const generateTaskId = (): string => {
  idCounter += 1
  return `task_${idCounter}_${Date.now().toString(36)}`
}

// Sample noisy texts for demonstration
const sampleNoisyTexts = [
  `The qulck brown f0x jumps over the 1azy d0g. Th1s is a c1assic pangram used to test fonts and keyboards. lt contains every 1etter of the a1phabet at 1east once.`,
  `ln the year 2024, artificia1 inte11igence has become an integra1 part of our dai1y 1ives. Fr0m smart assistants to se1f-driving cars, Al is everywhere.`,
  `The history of c0mputing dates back to the ear1y 19th century when Char1es Babbage designed the first mechanica1 computer. His Ana1ytica1 Engine was never comp1eted.`,
  `C1imate change is one of the most pressing issues facing our p1anet today. Rising temperatures, me1ting ice caps, and extreme weather events are just s0me of the consequences.`,
  `The human brain contains approximate1y 86 bi11ion neurons, each connected to thousands of other neur0ns through synapses. This comp1ex netw0rk enab1es thought, memory, and consciousness.`,
  `Shakespeare wrote 37 p1ays and 154 s0nnets during his 1ifetime. His w0rks have been trans1ated into every maj0r 1anguage and are performed more often than those of any 0ther p1aywright.`,
  `The Great Wa11 of China stretches over 13,000 mi1es and was bui1t over many centuries. lt is one of the most impressive architectura1 feats in human hist0ry.`,
  `Quantum c0mputing represents a fundamenta1 shift in how we pr0cess information. Un1ike c1assical computers that use bits, quantum c0mputers use qubits that can exist in mu1tip1e states simu1taneously.`,
]

// Create sample tasks with various statuses
const createSampleHistory = (status: TaskStatus): TaskHistoryEntry[] => {
  const history: TaskHistoryEntry[] = [
    {
      id: crypto.randomUUID(),
      action: TaskAction.Created,
      userId: 'user_admin_001',
      userName: 'Alex Admin',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      newStatus: TaskStatus.Pending,
    },
  ]

  if (status !== TaskStatus.Pending) {
    history.push({
      id: crypto.randomUUID(),
      action: TaskAction.Assigned,
      userId: 'user_admin_001',
      userName: 'Alex Admin',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      previousStatus: TaskStatus.Pending,
      newStatus: TaskStatus.InProgress,
    })
  }

  if ([TaskStatus.AwaitingReview, TaskStatus.InReview, TaskStatus.AwaitingFinalReview, TaskStatus.FinalReview, TaskStatus.Completed].includes(status)) {
    history.push({
      id: crypto.randomUUID(),
      action: TaskAction.Submitted,
      userId: 'user_annotator_001',
      userName: 'Taylor Annotator',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      previousStatus: TaskStatus.InProgress,
      newStatus: TaskStatus.AwaitingReview,
    })
  }

  if ([TaskStatus.InReview, TaskStatus.AwaitingFinalReview, TaskStatus.FinalReview, TaskStatus.Completed].includes(status)) {
    history.push({
      id: crypto.randomUUID(),
      action: TaskAction.ClaimedForReview,
      userId: 'user_reviewer_001',
      userName: 'Riley Reviewer',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      previousStatus: TaskStatus.AwaitingReview,
      newStatus: TaskStatus.InReview,
    })
  }

  if ([TaskStatus.AwaitingFinalReview, TaskStatus.FinalReview, TaskStatus.Completed].includes(status)) {
    history.push({
      id: crypto.randomUUID(),
      action: TaskAction.Approved,
      userId: 'user_reviewer_001',
      userName: 'Riley Reviewer',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      previousStatus: TaskStatus.InReview,
      newStatus: TaskStatus.AwaitingFinalReview,
      comment: 'Looks good, passing to final review.',
    })
  }

  if ([TaskStatus.FinalReview, TaskStatus.Completed].includes(status)) {
    history.push({
      id: crypto.randomUUID(),
      action: TaskAction.ClaimedForFinalReview,
      userId: 'user_final_001',
      userName: 'Morgan Manager',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      previousStatus: TaskStatus.AwaitingFinalReview,
      newStatus: TaskStatus.FinalReview,
    })
  }

  if (status === TaskStatus.Completed) {
    history.push({
      id: crypto.randomUUID(),
      action: TaskAction.FinalApproved,
      userId: 'user_final_001',
      userName: 'Morgan Manager',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      previousStatus: TaskStatus.FinalReview,
      newStatus: TaskStatus.Completed,
      comment: 'Approved for gold standard.',
    })
  }

  return history
}

// More sample noisy texts for batch tasks
const additionalNoisyTexts = [
  `The 0cean covers m0re than 70% of the Earth's surface. lt contains 97% of a11 water on Earth and produces more than ha1f of the w0r1d's oxygen.`,
  `M0zart began composing at the age of five. By the time he was seventeen, he had written over 200 w0rks including symph0nies, operas, and chamber music.`,
  `The G0lden Gate Bridge in San Francisc0 was completed in 1937. lt spans 1.7 mi1es and was the 1ongest suspension bridge in the w0r1d at that time.`,
  `Honey is the 0nly f00d that never sp0i1s. Archaeo1ogists have found 3,000-year-o1d honey in Egyptian tombs that was sti11 edib1e.`,
  `Mount Everest gr0ws approximately 4 mi11imeters ta11er each year due to ge0logical forces pushing the Hima1ayan mountain range upward.`,
  `The human heart beats approximate1y 100,000 times per day, pumping about 2,000 ga11ons of b100d through near1y 60,000 mi1es of b100d vesse1s.`,
]

// Initialize sample tasks
export const tasks: Task[] = [
  // Pending tasks for batch testing
  {
    id: 'task_001',
    imageUrl: 'https://www.cam.ac.uk/files/inner-images/140710-buddhas-word-manuscript3.jpg',
    imageId: 'IMG_001',
    imageOrder: 1,
    noisyText: sampleNoisyTexts[0],
    correctedText: '',
    status: TaskStatus.Pending,
    groupId: 'g1',
    batchName: 'Initial Batch',
    history: createSampleHistory(TaskStatus.Pending),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_002',
    imageUrl: 'https://picsum.photos/seed/doc2/800/600',
    imageId: 'IMG_002',
    imageOrder: 2,
    noisyText: sampleNoisyTexts[1],
    correctedText: '',
    status: TaskStatus.Pending,
    groupId: 'g1',
    batchName: 'Initial Batch',
    history: createSampleHistory(TaskStatus.Pending),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  // Additional pending tasks for batch (tasks 10-15)
  {
    id: 'task_010',
    imageUrl: 'https://picsum.photos/seed/doc10/800/600',
    imageId: 'IMG_010',
    imageOrder: 10,
    noisyText: additionalNoisyTexts[0],
    correctedText: '',
    status: TaskStatus.Pending,
    groupId: 'g1',
    batchName: 'Batch 3',
    history: createSampleHistory(TaskStatus.Pending),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_011',
    imageUrl: 'https://picsum.photos/seed/doc11/800/600',
    imageId: 'IMG_011',
    imageOrder: 11,
    noisyText: additionalNoisyTexts[1],
    correctedText: '',
    status: TaskStatus.Pending,
    groupId: 'g1',
    batchName: 'Batch 3',
    history: createSampleHistory(TaskStatus.Pending),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_012',
    imageUrl: 'https://picsum.photos/seed/doc12/800/600',
    imageId: 'IMG_012',
    imageOrder: 12,
    noisyText: additionalNoisyTexts[2],
    correctedText: '',
    status: TaskStatus.Pending,
    groupId: 'g1',
    batchName: 'Batch 3',
    history: createSampleHistory(TaskStatus.Pending),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_013',
    imageUrl: 'https://picsum.photos/seed/doc13/800/600',
    imageId: 'IMG_013',
    imageOrder: 13,
    noisyText: additionalNoisyTexts[3],
    correctedText: '',
    status: TaskStatus.Pending,
    groupId: 'g1',
    batchName: 'Batch 3',
    history: createSampleHistory(TaskStatus.Pending),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_014',
    imageUrl: 'https://picsum.photos/seed/doc14/800/600',
    imageId: 'IMG_014',
    imageOrder: 14,
    noisyText: additionalNoisyTexts[4],
    correctedText: '',
    status: TaskStatus.Pending,
    groupId: 'g1',
    batchName: 'Batch 3',
    history: createSampleHistory(TaskStatus.Pending),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_015',
    imageUrl: 'https://picsum.photos/seed/doc15/800/600',
    imageId: 'IMG_015',
    imageOrder: 15,
    noisyText: additionalNoisyTexts[5],
    correctedText: '',
    status: TaskStatus.Pending,
    groupId: 'g1',
    batchName: 'Batch 3',
    history: createSampleHistory(TaskStatus.Pending),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // In Progress tasks
  {
    id: 'task_003',
    imageUrl: 'https://www.cam.ac.uk/files/inner-images/140710-buddhas-word-manuscript3.jpg',
    imageId: 'IMG_003',
    imageOrder: 3,
    noisyText: sampleNoisyTexts[2],
    correctedText: 'The history of computing dates back to the early 19th century when Charles Babbage designed the first mechanical computer.',
    status: TaskStatus.InProgress,
    groupId: 'g2',
    batchName: 'Batch 2',
    assignedTo: 'user_annotator_001',
    assignedToName: 'Taylor Annotator',
    history: createSampleHistory(TaskStatus.InProgress),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_004',
    imageUrl: 'https://picsum.photos/seed/doc4/800/600',
    imageId: 'IMG_004',
    imageOrder: 4,
    noisyText: sampleNoisyTexts[3],
    correctedText: '',
    status: TaskStatus.InProgress,
    groupId: 'g2',
    batchName: 'Batch 2',
    assignedTo: 'user_annotator_002',
    assignedToName: 'Jordan Jones',
    history: createSampleHistory(TaskStatus.InProgress),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  // Awaiting Review
  {
    id: 'task_005',
    imageUrl: 'https://picsum.photos/seed/doc5/800/600',
    imageId: 'IMG_005',
    imageOrder: 5,
    noisyText: sampleNoisyTexts[4],
    correctedText: 'The human brain contains approximately 86 billion neurons, each connected to thousands of other neurons through synapses. This complex network enables thought, memory, and consciousness.',
    status: TaskStatus.AwaitingReview,
    groupId: 'g1',
    batchName: 'Initial Batch',
    assignedTo: 'user_annotator_001',
    assignedToName: 'Taylor Annotator',
    history: createSampleHistory(TaskStatus.AwaitingReview),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  // In Review
  {
    id: 'task_006',
    imageUrl: 'https://picsum.photos/seed/doc6/800/600',
    imageId: 'IMG_006',
    imageOrder: 6,
    noisyText: sampleNoisyTexts[5],
    correctedText: 'Shakespeare wrote 37 plays and 154 sonnets during his lifetime. His works have been translated into every major language and are performed more often than those of any other playwright.',
    status: TaskStatus.InReview,
    groupId: 'g1',
    batchName: 'Initial Batch',
    assignedTo: 'user_annotator_001',
    assignedToName: 'Taylor Annotator',
    reviewerId: 'user_reviewer_001',
    reviewerName: 'Riley Reviewer',
    history: createSampleHistory(TaskStatus.InReview),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  // Awaiting Final Review
  {
    id: 'task_007',
    imageUrl: 'https://picsum.photos/seed/doc7/800/600',
    imageId: 'IMG_007',
    imageOrder: 7,
    noisyText: sampleNoisyTexts[6],
    correctedText: 'The Great Wall of China stretches over 13,000 miles and was built over many centuries. It is one of the most impressive architectural feats in human history.',
    status: TaskStatus.AwaitingFinalReview,
    groupId: 'g2',
    batchName: 'Batch 2',
    assignedTo: 'user_annotator_002',
    assignedToName: 'Jordan Jones',
    reviewerId: 'user_reviewer_001',
    reviewerName: 'Riley Reviewer',
    history: createSampleHistory(TaskStatus.AwaitingFinalReview),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // Completed
  {
    id: 'task_008',
    imageUrl: 'https://picsum.photos/seed/doc8/800/600',
    imageId: 'IMG_008',
    imageOrder: 8,
    noisyText: sampleNoisyTexts[7],
    correctedText: 'Quantum computing represents a fundamental shift in how we process information. Unlike classical computers that use bits, quantum computers use qubits that can exist in multiple states simultaneously.',
    status: TaskStatus.Completed,
    groupId: 'g1',
    batchName: 'Initial Batch',
    assignedTo: 'user_annotator_001',
    assignedToName: 'Taylor Annotator',
    reviewerId: 'user_reviewer_001',
    reviewerName: 'Riley Reviewer',
    finalReviewerId: 'user_final_001',
    finalReviewerName: 'Morgan Manager',
    history: createSampleHistory(TaskStatus.Completed),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  // Rejected task (sent back for rework)
  {
    id: 'task_009',
    imageUrl: 'https://picsum.photos/seed/doc9/800/600',
    imageId: 'IMG_009',
    imageOrder: 9,
    noisyText: `The Amaz0n rainf0rest produces about 20% of the w0r1d's oxygen. lt is home to mi11ions of species, many of which have not yet been disc0vered by scientists.`,
    correctedText: 'The Amazon rainforest produces about 20% of the worlds oxygen.',
    status: TaskStatus.Rejected,
    groupId: 'g2',
    batchName: 'Batch 2',
    assignedTo: 'user_annotator_002',
    assignedToName: 'Jordan Jones',
    reviewerId: 'user_reviewer_001',
    reviewerName: 'Riley Reviewer',
    history: [
      ...createSampleHistory(TaskStatus.InReview),
      {
        id: crypto.randomUUID(),
        action: TaskAction.Rejected,
        userId: 'user_reviewer_001',
        userName: 'Riley Reviewer',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        previousStatus: TaskStatus.InReview,
        newStatus: TaskStatus.Rejected,
        comment: 'Incomplete transcription - missing second half of the text.',
      },
    ],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

// Helper to find task by ID
export const findTaskById = (id: string): Task | undefined => {
  return tasks.find(task => task.id === id)
}

// Helper to delete task by ID
export const deleteTaskById = (id: string): boolean => {
  const index = tasks.findIndex(task => task.id === id)
  if (index === -1) return false
  tasks.splice(index, 1)
  return true
}

// Helper to add task
export const addTask = (task: Task): void => {
  tasks.push(task)
}

