import { useState, useEffect } from 'react'
import { MIN_IMAGE_WIDTH, MAX_IMAGE_WIDTH, DEFAULT_IMAGE_WIDTH } from '../constants'

interface UseColumnResizeReturn {
  imageWidthPercent: number
  isResizing: boolean
  handleResizeStart: (e: React.MouseEvent) => void
}

/**
 * Custom hook for managing column resize behavior in the editor.
 * Handles mouse drag to resize the image/transcription column split.
 *
 * @param containerSelector - CSS selector for the resize container
 * @returns Object with resize state and handlers
 */
export function useColumnResize(containerSelector = '[data-resize-container]'): UseColumnResizeReturn {
  const [imageWidthPercent, setImageWidthPercent] = useState(DEFAULT_IMAGE_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(DEFAULT_IMAGE_WIDTH)

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setResizeStartX(e.clientX)
    setResizeStartWidth(imageWidthPercent)
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector(containerSelector)
      if (!container) return

      const containerWidth = container.getBoundingClientRect().width
      const deltaX = e.clientX - resizeStartX
      const deltaPercent = (deltaX / containerWidth) * 100
      const newWidth = Math.min(
        MAX_IMAGE_WIDTH,
        Math.max(MIN_IMAGE_WIDTH, resizeStartWidth + deltaPercent)
      )

      setImageWidthPercent(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, resizeStartX, resizeStartWidth, containerSelector])

  return {
    imageWidthPercent,
    isResizing,
    handleResizeStart,
  }
}
