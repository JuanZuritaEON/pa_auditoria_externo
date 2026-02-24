import DocViewer, {
  DocViewerRenderers,
  IConfig,
} from '@cyntler/react-doc-viewer'
import { memo } from 'react'
import { DocumentsViewerHeader } from '../DocumentsViewerHeader'
import { DocumentsViewerMenu } from '../DocumentsViewerMenu'
import { Viewer, Wrapper } from './DocumentsViewer.styles'
import { AudioPlayer, Loader, NoDataBox } from '../..'
import { DocumentsViewerProps } from '../../../Redux'
import { useDocumentsViewer } from '../../../Hooks'

const NoRenderer = () => <NoDataBox text={'Archivo incompatible'} />

const EmptyDocuments = () => <NoDataBox text={'Sin información que mostrar para esta sección'} />

const CONFIG: IConfig = {
  loadingRenderer: {
    overrideComponent: () => <Loader />,
  },
  noRenderer: {
    overrideComponent: NoRenderer,
  },
  header: {
    disableHeader: true,
    disableFileName: true,
  },
}

const DocumentsViewer = ({
  documents,
  error,
  loading = false,
  handleDelete
}: DocumentsViewerProps) => {
  const {
    activeDocument,
    forceNoRender,
    hasError,
    loadFile,
    showHeader,
    showMenu,
    zoom,
    ...rest
  } = useDocumentsViewer({ documents, error, loading })
  
  if (loadFile) return <Loader />

  if (hasError) return <EmptyDocuments />

  const showViewer = () => forceNoRender ? <NoRenderer /> : <DocViewer
    activeDocument={activeDocument}
    className='cdc-doc-viewer'
    config={CONFIG}
    documents={documents}
    language='es'
    pluginRenderers={DocViewerRenderers}
    {...rest}
  />

  return (
    <Wrapper $showMenu={showMenu}>
      {showMenu && (
        <DocumentsViewerMenu
          activeDocument={activeDocument}
          documents={documents}
          handleRemoveDocument={handleDelete}
          {...rest}
        />
      )}

      <Viewer zoom={zoom}>
        {showHeader && (
          <DocumentsViewerHeader {...rest} />
        )}

        {
          activeDocument.isAudio ? 
          <AudioPlayer fileName={activeDocument.fileName} src={activeDocument.uri} /> : 
          showViewer()
        }
      </Viewer>
    </Wrapper>
  )
}

export default memo(DocumentsViewer)