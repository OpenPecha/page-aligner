import { useState, useEffect, useCallback } from 'react'
import * as UTIF from 'utif2'

export function useTiffImage(imageUrl: string) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTiffImage = useCallback(async (url: string) => {
    setIsConverting(true)
    setError(null)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      const dataUrl = decodeTiffToDataUrl(buffer)
      setDisplayUrl(dataUrl)
    } catch (err) {
      const message = 'Failed to load TIFF image'
      setError(message)
      console.error('TIFF loading error:', err)
    } finally {
      setIsConverting(false)
    }
  }, [])

  useEffect(() => {
    if (!imageUrl) {
      setDisplayUrl(null)
      return
    }
    const proxiedUrl = getProxiedUrl(imageUrl)
    if (isTiffUrl(imageUrl)) {
      loadTiffImage(proxiedUrl)
    } else {
      setDisplayUrl(proxiedUrl)
      setIsConverting(false)
      setError(null)
    }
  }, [imageUrl, loadTiffImage])
  
    return { displayUrl, isConverting, error }
  }

  /**
 * Decodes a TIFF image buffer and returns a data URL
 */
function decodeTiffToDataUrl(buffer: ArrayBuffer): string {
    const ifds = UTIF.decode(buffer)
    if (ifds.length === 0) {
      throw new Error('No pages found in TIFF file')
    }
  
    // Decode the first page
    UTIF.decodeImage(buffer, ifds[0])
    const firstPage = ifds[0]
    const rgba = UTIF.toRGBA8(firstPage)
  
    // Create canvas and draw the image
    const canvas = document.createElement('canvas')
    canvas.width = firstPage.width
    canvas.height = firstPage.height
  
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
  
    const imageData = ctx.createImageData(firstPage.width, firstPage.height)
    imageData.data.set(rgba)
    ctx.putImageData(imageData, 0, 0)
  
    return canvas.toDataURL('image/png')
  }

function isTiffUrl(url: string): boolean {
  return url.endsWith('.tiff') || url.endsWith('.tif') || url.endsWith('.TIFF') || url.endsWith('.TIF')
}

/**
 * Converts S3 URLs to use the Vite proxy in development to bypass CORS
 */
function getProxiedUrl(url: string): string {
  if (import.meta.env.DEV && url.includes('s3.us-east-1.amazonaws.com')) {
    return url.replace('https://s3.us-east-1.amazonaws.com', '/s3-proxy')
  }
  return url
}