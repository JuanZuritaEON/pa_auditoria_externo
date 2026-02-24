import { useState } from 'react'

const INITIAL_SCALE = 1

const ZOOM = 0.3

export const useZoom = () => {
  const [zoom, setZoom] = useState<number>(INITIAL_SCALE)

  const handleZoomIn = () => setZoom((prev) => prev + ZOOM)

  const handleZoomOut = () => setZoom((prev) => Math.max(prev - ZOOM, 1))

  const handleZoomReset = () => setZoom(INITIAL_SCALE)

  return {
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    zoom,
  }
}