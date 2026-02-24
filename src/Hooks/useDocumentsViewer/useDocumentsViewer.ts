import { UseDocumentsViewerParams } from './useDocumentsViewer.types'
import { useEffect, useState } from 'react'
import { downloadFile } from '../../Utils'
import { ContentType } from '../../Redux'
import { isEmpty, isNil } from 'lodash'
import { useZoom } from '../'

const I_DOCUMENTS_WITHOUT_ZOOM = [
  ContentType.JPEG_TYPE,
  ContentType.JPG_TYPE,
  ContentType.PNG_TYPE,
  ContentType.TIF_TYPE,
  ContentType.TIFF_TYPE
]

export const useDocumentsViewer = ({
  documents,
  error,
  loading,
}: UseDocumentsViewerParams) => {
  const zoom = useZoom()
  const [initialActiveDocument] = documents || []
  const [activeDocument, setActiveDocument] = useState(initialActiveDocument)
  const [forceNoRender, setForceNoRender] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [loadFile, setLoadFile] = useState(loading)
  const [showMenu, setShowMenu] = useState(false)
  const [showZoom, setShowZoom] = useState(false)
  const hasError = !isNil(error) || (!loading && isEmpty(documents))

  const handleDownload = async () => {
    if (activeDocument) {
      const { fileName, uri } = activeDocument

      downloadFile({ fileName, url: uri })
    }
  }

  const handleChangeDocument = (
    index: string 
  ) => {
    const newDocument = documents?.find(({ fileName }) => fileName === index)
    
    if (!isNil(newDocument)) {
      if (newDocument.fileName === activeDocument.fileName) return
      setLoadFile(true)
      setActiveDocument(newDocument)
    }
  }

  useEffect(() => {
    setLoadFile(true)
    if (!isEmpty(documents)) {
      const [firstDocument] = documents || []

      setActiveDocument(firstDocument)
    }
  }, [documents])

  useEffect(() => {
    if (!isNil(documents)) {
      const existActiveDocument = !isEmpty(initialActiveDocument)

      setShowMenu(existActiveDocument)
    }
  }, [documents, initialActiveDocument])

  useEffect(() => {
    setLoadFile(false)
    setForceNoRender(false)
    if (!isEmpty(activeDocument?.fileType)) {
      const { fileType } = activeDocument
      const hasFileType = !isEmpty(fileType)

      setForceNoRender(hasFileType && (fileType === ContentType.PPTX_TYPE || fileType === ContentType.DOCX_TYPE))

      setShowHeader(
        hasFileType &&
        fileType !== ContentType.PDF_TYPE
      )

      setShowZoom(
        hasFileType &&
        I_DOCUMENTS_WITHOUT_ZOOM.includes(fileType)
      )
    }
  }, [activeDocument])

  return {
    activeDocument,
    handleChangeDocument,
    handleDownload,
    forceNoRender,
    hasError,
    loadFile,
    showHeader,
    showMenu,
    showZoom,
    ...zoom,
  }
}