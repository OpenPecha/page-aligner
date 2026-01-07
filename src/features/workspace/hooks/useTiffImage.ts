import { useState, useEffect, useCallback } from 'react'
import * as UTIF from 'utif2'

export function useTiffImage(imageUrl: string) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTiffImage = useCallback(async (url: string, originalUrl: string) => {
    setIsConverting(true)
    setError(null)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()

      // Check if the file is actually a TIFF by inspecting magic bytes
      if (isTiffBuffer(buffer)) {
        const dataUrl = decodeTiffToDataUrl(buffer)
        setDisplayUrl(dataUrl)
      } else {
        // Not a real TIFF (e.g., PNG/JPEG with wrong extension), use original URL
        setDisplayUrl(originalUrl)
      }
    } catch (err) {
      const message = 'Failed to load image'
      setError(message)
      console.error('Image loading error:', err)
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
      loadTiffImage(proxiedUrl, proxiedUrl)
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
 * Detects if a buffer contains a TIFF image by checking magic bytes
 * TIFF files start with either:
 * - Little-endian: 0x49 0x49 0x2A 0x00 ("II" + 42)
 * - Big-endian: 0x4D 0x4D 0x00 0x2A ("MM" + 42)
 */
function isTiffBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false

  const bytes = new Uint8Array(buffer, 0, 4)

  // Little-endian TIFF: II*\0
  const isLittleEndian =
    bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00

  // Big-endian TIFF: MM\0*
  const isBigEndian =
    bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a

  return isLittleEndian || isBigEndian
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