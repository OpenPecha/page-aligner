import { create } from 'zustand'

// Re-export useUIStore from the original file
export { useUIStore } from './use-ui-store'
export type { EditorFontFamily, EditorFontSize } from './use-ui-store'

// ============================================
// Editor Store for Page Alignment
// ============================================

// Internal editor text block (maps from API TaskText)
export interface EditorText {
  id: string
  order: number
  text: string
}

interface HistoryState {
  past: EditorText[][]
  future: EditorText[][]
}

interface EditorState {
  // Editor text blocks
  texts: EditorText[]
  originalTexts: EditorText[]
  
  // Active block
  activeBlockId: string | null
  
  // Scroll sync
  scrollIndex: number
  
  // History for undo/redo
  history: HistoryState
  
  // Dirty blocks tracking (for debounced save)
  dirtyBlockIds: Set<string>
  
  // Actions
  initializeTexts: (texts: EditorText[]) => void
  setActiveBlock: (id: string | null) => void
  setScrollIndex: (index: number) => void
  
  // Block mutations
  updateBlockText: (id: string, text: string) => void
  addBlockAbove: (targetId: string, newBlock: EditorText) => void
  addBlockBelow: (targetId: string, newBlock: EditorText) => void
  deleteBlock: (id: string) => void
  
  // Order calculation helpers (for API calls)
  getOrderForAbove: (targetId: string) => number | null
  getOrderForBelow: (targetId: string) => number | null
  
  // History actions
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Dirty tracking
  markBlockDirty: (id: string) => void
  markBlockClean: (id: string) => void
  isDirty: (id: string) => boolean
  
  // Reset
  reset: () => void
  hasChanges: () => boolean
}

const MAX_HISTORY_SIZE = 50

// Deep clone texts
const cloneTexts = (texts: EditorText[]): EditorText[] =>
  texts.map(t => ({ ...t }))

export const useEditorStore = create<EditorState>()((set, get) => ({
  // Initial state
  texts: [],
  originalTexts: [],
  activeBlockId: null,
  scrollIndex: 0,
  history: { past: [], future: [] },
  dirtyBlockIds: new Set(),
  
  // Initialize with task data
  initializeTexts: (texts) => {
    const sorted = [...texts].sort((a, b) => a.order - b.order)
    set({
      texts: cloneTexts(sorted),
      originalTexts: cloneTexts(sorted),
      activeBlockId: null,
      scrollIndex: 0,
      history: { past: [], future: [] },
      dirtyBlockIds: new Set(),
    })
  },
  
  setActiveBlock: (id) => set({ activeBlockId: id }),
  
  setScrollIndex: (index) => set({ scrollIndex: index }),
  
  // Save current state to history before mutation
  updateBlockText: (id, text) => {
    const { texts, history } = get()
    const newPast = [...history.past, cloneTexts(texts)].slice(-MAX_HISTORY_SIZE)
    
    set({
      texts: texts.map(t =>
        t.id === id ? { ...t, text } : t
      ),
      history: { past: newPast, future: [] },
    })
    get().markBlockDirty(id)
  },
  
  // Calculate order for inserting above target (used before API call)
  getOrderForAbove: (targetId) => {
    const { texts } = get()
    const targetIndex = texts.findIndex(t => t.id === targetId)
    if (targetIndex === -1) return null
    
    const currentOrder = texts[targetIndex].order
    const previousOrder = targetIndex > 0 ? texts[targetIndex - 1].order : 0
    
    return targetIndex === 0 
      ? currentOrder / 2 
      : (currentOrder + previousOrder) / 2
  },
  
  // Calculate order for inserting below target (used before API call)
  getOrderForBelow: (targetId) => {
    const { texts } = get()
    const targetIndex = texts.findIndex(t => t.id === targetId)
    if (targetIndex === -1) return null
    
    const currentOrder = texts[targetIndex].order
    const nextOrder = targetIndex < texts.length - 1 ? texts[targetIndex + 1].order : currentOrder + 2
    
    return targetIndex === texts.length - 1
      ? currentOrder + 1
      : (currentOrder + nextOrder) / 2
  },
  
  // Add block above target (called after API returns server ID)
  addBlockAbove: (targetId, newBlock) => {
    const { texts, history } = get()
    const targetIndex = texts.findIndex(t => t.id === targetId)
    if (targetIndex === -1) return
    
    const newPast = [...history.past, cloneTexts(texts)].slice(-MAX_HISTORY_SIZE)
    
    // Insert new block at correct position
    const newTexts = [...texts]
    newTexts.splice(targetIndex, 0, newBlock)
    
    set({
      texts: newTexts,
      history: { past: newPast, future: [] },
      activeBlockId: newBlock.id,
    })
  },
  
  // Add block below target (called after API returns server ID)
  addBlockBelow: (targetId, newBlock) => {
    const { texts, history } = get()
    const targetIndex = texts.findIndex(t => t.id === targetId)
    if (targetIndex === -1) return
    
    const newPast = [...history.past, cloneTexts(texts)].slice(-MAX_HISTORY_SIZE)
    
    // Insert new block at correct position
    const newTexts = [...texts]
    newTexts.splice(targetIndex + 1, 0, newBlock)
    
    set({
      texts: newTexts,
      history: { past: newPast, future: [] },
      activeBlockId: newBlock.id,
    })
  },
  
  deleteBlock: (id) => {
    const { texts, history } = get()
    if (texts.length <= 1) return // Don't delete last block
    
    const newPast = [...history.past, cloneTexts(texts)].slice(-MAX_HISTORY_SIZE)
    const filtered = texts.filter(t => t.id !== id)
    
    // Update orders
    const reordered = filtered.map((t, i) => ({ ...t, order: i + 1 }))
    
    set({
      texts: reordered,
      history: { past: newPast, future: [] },
      activeBlockId: null,
    })
  },
  
  undo: () => {
    const { history, texts } = get()
    if (history.past.length === 0) return
    
    const newPast = [...history.past]
    const previous = newPast.pop()!
    const newFuture = [cloneTexts(texts), ...history.future].slice(0, MAX_HISTORY_SIZE)
    
    set({
      texts: previous,
      history: { past: newPast, future: newFuture },
    })
  },
  
  redo: () => {
    const { history, texts } = get()
    if (history.future.length === 0) return
    
    const newFuture = [...history.future]
    const next = newFuture.shift()!
    const newPast = [...history.past, cloneTexts(texts)].slice(-MAX_HISTORY_SIZE)
    
    set({
      texts: next,
      history: { past: newPast, future: newFuture },
    })
  },
  
  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,
  
  markBlockDirty: (id) => {
    set(state => ({
      dirtyBlockIds: new Set(state.dirtyBlockIds).add(id),
    }))
  },
  
  markBlockClean: (id) => {
    set(state => {
      const newSet = new Set(state.dirtyBlockIds)
      newSet.delete(id)
      return { dirtyBlockIds: newSet }
    })
  },
  
  isDirty: (id) => get().dirtyBlockIds.has(id),
  
  reset: () => {
    const { originalTexts } = get()
    set({
      texts: cloneTexts(originalTexts),
      activeBlockId: null,
      scrollIndex: 0,
      history: { past: [], future: [] },
      dirtyBlockIds: new Set(),
    })
  },
  
  hasChanges: () => {
    const { texts, originalTexts } = get()
    if (texts.length !== originalTexts.length) return true
    return texts.some((t, i) => 
      t.text !== originalTexts[i]?.text || t.order !== originalTexts[i]?.order
    )
  },
}))
