import { useState, useRef, useEffect } from 'react'
import { SCROLL_THRESHOLD } from '../constants'

/**
 * Custom hook to detect scroll direction within a virtualized list container.
 * Uses MutationObserver and scroll event delegation to track scroll position
 * even when react-window creates dynamic scrollable elements.
 *
 * @param containerRef - Reference to the container element
 * @param threshold - Minimum scroll delta to trigger visibility change
 * @returns Object containing isVisible state
 */
export function useVirtualizedScrollDirection(
  containerRef: React.RefObject<HTMLElement | null>,
  threshold = SCROLL_THRESHOLD
) {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target || ticking.current) return

      ticking.current = true
      requestAnimationFrame(() => {
        const scrollY = target.scrollTop

        if (Math.abs(scrollY - lastScrollY.current) > threshold) {
          const isScrollingUp = scrollY < lastScrollY.current
          setIsVisible(isScrollingUp || scrollY < threshold)
          lastScrollY.current = scrollY
        }

        ticking.current = false
      })
    }

    // Find the actual scrollable element (react-window creates a scrollable div)
    const findScrollableChild = () => {
      const scrollable = container.querySelector('[style*="overflow"]') as HTMLElement
      return scrollable || container
    }

    let scrollElement = findScrollableChild()

    const addListener = (el: HTMLElement) => {
      el.addEventListener('scroll', handleScroll, { passive: true })
    }

    const removeListener = (el: HTMLElement) => {
      el.removeEventListener('scroll', handleScroll)
    }

    addListener(scrollElement)

    // Watch for DOM changes (react-window might create elements dynamically)
    const observer = new MutationObserver(() => {
      const newScrollable = findScrollableChild()
      if (newScrollable !== scrollElement) {
        removeListener(scrollElement)
        scrollElement = newScrollable
        addListener(scrollElement)
      }
    })

    observer.observe(container, { childList: true, subtree: true })

    return () => {
      removeListener(scrollElement)
      observer.disconnect()
    }
  }, [containerRef, threshold])

  return { isVisible }
}
