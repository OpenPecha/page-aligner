import type { CSSProperties, ReactElement } from 'react'
import type { DynamicRowHeight } from 'react-window'
import { EditorRow } from './editor-row'
import type { TaskImage } from '@/types/task'
import type { EditorText } from '@/store/use-editor-store'

// Row data type for aligned image + text
export interface AlignedRow {
  image?: TaskImage
  editorText?: EditorText
}

// Block action state type
export type BlockAction = { blockId: string; action: 'addAbove' | 'addBelow' | 'delete' } | null

// Props passed to each row via rowProps
export interface EditorRowProps {
  alignedData: AlignedRow[]
  activeBlockId: string | null
  imageWidthPercent: number
  fontFamily: string
  fontSize: number
  savingBlocks: Set<string>
  blockAction: BlockAction
  canDelete: boolean
  onFocus: (index: number, id: string) => void
  onTextChange: (id: string, text: string) => void
  onAddAbove: (id: string, count: number) => void
  onAddBelow: (id: string, count: number) => void
  onDelete: (id: string) => void
  dynamicRowHeight: DynamicRowHeight
}

interface EditorRowWrapperProps extends EditorRowProps {
  ariaAttributes: {
    'aria-posinset': number
    'aria-setsize': number
    role: 'listitem'
  }
  index: number
  style: CSSProperties
}

/**
 * Wrapper component for EditorRow that integrates with react-window v2.
 * Handles virtualization layout and dynamic row height measurement.
 * Supports both text+image rows and image-only rows (when texts < images).
 */
export function EditorRowWrapper(props: EditorRowWrapperProps): ReactElement | null {
  const {
    index,
    style,
    alignedData,
    activeBlockId,
    imageWidthPercent,
    fontFamily,
    fontSize,
    savingBlocks,
    blockAction,
    canDelete,
    onFocus,
    onTextChange,
    onAddAbove,
    onAddBelow,
    onDelete,
    dynamicRowHeight,
  } = props

  const { image, editorText } = alignedData[index]

  // Composite ID: use editorText.id if available, otherwise use image.id
  const rowId = editorText?.id ?? (image ? `image-${image.id}` : `row-${index}`)
  const isImageOnlyRow = !editorText

  const handleHeightChange = () => {
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-row-index="${index}"]`)
      if (el) {
        const height = el.scrollHeight
        if (height > 0) {
          dynamicRowHeight.setRowHeight(index, height)
        }
      }
    })
  }

  // Determine loading states for this specific row (only applicable for text blocks)
  const isThisBlockAction = editorText && blockAction?.blockId === editorText.id
  const isAddingAbove = isThisBlockAction && blockAction?.action === 'addAbove'
  const isAddingBelow = isThisBlockAction && blockAction?.action === 'addBelow'
  const isDeleting = isThisBlockAction && blockAction?.action === 'delete'
  const isAnyActionPending = blockAction !== null

  return (
    <div style={style} data-row-index={index}>
      <EditorRow
        image={image}
        editorText={editorText}
        isActive={activeBlockId === rowId}
        imageWidthPercent={imageWidthPercent}
        fontFamily={fontFamily}
        fontSize={fontSize}
        isSaving={editorText ? savingBlocks.has(editorText.id) : false}
        isAddingAbove={isAddingAbove}
        isAddingBelow={isAddingBelow}
        isDeleting={isDeleting}
        isAnyActionPending={isImageOnlyRow ? false : isAnyActionPending}
        canDelete={isImageOnlyRow ? false : canDelete}
        onFocus={() => onFocus(index, rowId)}
        onTextChange={editorText ? (text) => onTextChange(editorText.id, text) : undefined}
        onAddAbove={editorText ? (count) => onAddAbove(editorText.id, count) : undefined}
        onAddBelow={editorText ? (count) => onAddBelow(editorText.id, count) : undefined}
        onDelete={editorText ? () => onDelete(editorText.id) : undefined}
        onHeightChange={handleHeightChange}
      />
    </div>
  )
}
