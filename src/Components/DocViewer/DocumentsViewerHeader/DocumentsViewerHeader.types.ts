export type DocumentsViewerHeaderProps = {
  handleZoomOut: () => void
  handleZoomIn: () => void
  handleZoomReset: () => void
  handleDownload?: () => void
  showZoom?: boolean
}