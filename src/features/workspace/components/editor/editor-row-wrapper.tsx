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

// Props passed to each row via rowProps
export interface EditorRowProps {
  alignedData: AlignedRow[]
  activeBlockId: string | null
  imageWidthPercent: number
  fontFamily: string
  fontSize: number
  savingBlocks: Set<string>
  canDelete: boolean
  onFocus: (index: number, id: string) => void
  onTextChange: (id: string, text: string) => void
  onAddAbove: (id: string) => void
  onAddBelow: (id: string) => void
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
    canDelete,
    onFocus,
    onTextChange,
    onAddAbove,
    onAddBelow,
    onDelete,
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
        canDelete={canDelete}
        onFocus={() => onFocus(index, editorText.id)}
        onTextChange={(text) => onTextChange(editorText.id, text)}
        onAddAbove={() => onAddAbove(editorText.id)}
        onAddBelow={() => onAddBelow(editorText.id)}
        onDelete={() => onDelete(editorText.id)}
        onHeightChange={handleHeightChange}
      />
    </div>
  )
}
