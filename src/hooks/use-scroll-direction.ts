import { useState, useEffect, useCallback, useRef } from 'react'

export type ScrollDirection = 'up' | 'down' | null

interface UseScrollDirectionOptions {
  threshold?: number
  initialVisible?: boolean
}

interface UseScrollDirectionReturn {
  scrollDirection: ScrollDirection
  isVisible: boolean
}

/**
 * Hook to detect scroll direction and control header visibility
 * Shows header when scrolling up, hides when scrolling down
 */
export function useScrollDirection(
  options: UseScrollDirectionOptions = {}
): UseScrollDirectionReturn {
  const { threshold = 10, initialVisible = true } = options
  
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [isVisible, setIsVisible] = useState(initialVisible)
  
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY

    if (Math.abs(scrollY - lastScrollY.current) < threshold) {
      ticking.current = false
      return
    }

    const direction = scrollY > lastScrollY.current ? 'down' : 'up'
    
    setScrollDirection(direction)
    setIsVisible(direction === 'up' || scrollY < threshold)
    
    lastScrollY.current = scrollY > 0 ? scrollY : 0
    ticking.current = false
  }, [threshold])

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    // Set initial scroll position
    lastScrollY.current = window.scrollY

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [updateScrollDirection])

  return { scrollDirection, isVisible }
}

/**
 * Hook to detect scroll direction within a specific container element
 */
export function useContainerScrollDirection(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseScrollDirectionOptions = {}
): UseScrollDirectionReturn {
  const { threshold = 10, initialVisible = true } = options
  
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [isVisible, setIsVisible] = useState(initialVisible)
  
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateScrollDirection = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      ticking.current = false
      return
    }

    const scrollY = container.scrollTop

    if (Math.abs(scrollY - lastScrollY.current) < threshold) {
      ticking.current = false
      return
    }

    const direction = scrollY > lastScrollY.current ? 'down' : 'up'
    
    setScrollDirection(direction)
    setIsVisible(direction === 'up' || scrollY < threshold)
    
    lastScrollY.current = scrollY > 0 ? scrollY : 0
    ticking.current = false
  }, [containerRef, threshold])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    // Set initial scroll position
    lastScrollY.current = container.scrollTop

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, updateScrollDirection])

  return { scrollDirection, isVisible }
}
