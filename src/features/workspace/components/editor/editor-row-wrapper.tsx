import type { CSSProperties, ReactElement } from 'react'
import type { DynamicRowHeight } from 'react-window'
import { EditorRow } from './editor-row'
import type { TaskImage } from '@/types/task'
import type { EditorText } from '@/store/use-editor-store'

// Row data type for aligned image + text
export interface AlignedRow {
  image?: TaskImage
  editorText: EditorText
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
  activeCountInput: { blockId: string; type: 'above' | 'below' } | null
  onFocus: (index: number, id: string) => void
  onTextChange: (id: string, text: string) => void
  onAddAbove: (id: string, count: number) => void
  onAddBelow: (id: string, count: number) => void
  onDelete: (id: string) => void
  onShowCountInput: (blockId: string, type: 'above' | 'below') => void
  onHideCountInput: () => void
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
    activeCountInput,
    onFocus,
    onTextChange,
    onAddAbove,
    onAddBelow,
    onDelete,
    onShowCountInput,
    onHideCountInput,
    dynamicRowHeight,
  } = props

  const { image, editorText } = alignedData[index]

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

  // Determine loading states for this specific row
  const isThisBlockAction = blockAction?.blockId === editorText.id
  const isAddingAbove = isThisBlockAction && blockAction?.action === 'addAbove'
  const isAddingBelow = isThisBlockAction && blockAction?.action === 'addBelow'
  const isDeleting = isThisBlockAction && blockAction?.action === 'delete'
  const isAnyActionPending = blockAction !== null

  // Determine if count input is active for this row
  const isCountInputAbove = activeCountInput?.blockId === editorText.id && activeCountInput?.type === 'above'
  const isCountInputBelow = activeCountInput?.blockId === editorText.id && activeCountInput?.type === 'below'

  return (
    <div style={style} data-row-index={index}>
      <EditorRow
        image={image}
        editorText={editorText}
        isActive={activeBlockId === editorText.id}
        imageWidthPercent={imageWidthPercent}
        fontFamily={fontFamily}
        fontSize={fontSize}
        isSaving={savingBlocks.has(editorText.id)}
        isAddingAbove={isAddingAbove}
        isAddingBelow={isAddingBelow}
        isDeleting={isDeleting}
        isAnyActionPending={isAnyActionPending}
        canDelete={canDelete}
        isCountInputAbove={isCountInputAbove}
        isCountInputBelow={isCountInputBelow}
        onFocus={() => onFocus(index, editorText.id)}
        onTextChange={(text) => onTextChange(editorText.id, text)}
        onAddAbove={(count) => onAddAbove(editorText.id, count)}
        onAddBelow={(count) => onAddBelow(editorText.id, count)}
        onDelete={() => onDelete(editorText.id)}
        onShowCountInput={(type) => onShowCountInput(editorText.id, type)}
        onHideCountInput={onHideCountInput}
        onHeightChange={handleHeightChange}
      />
    </div>
  )
}
