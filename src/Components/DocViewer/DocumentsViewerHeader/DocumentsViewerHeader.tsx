import {
  ArrowPathIcon,
  CloudArrowDownIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline'
import { IconCta } from '../..'
import {
  DownloadButton,
  ZoomButton,
  Wrapper,
} from './DocumentsViewerHeader.styles'
import {
  DocumentsViewerHeaderProps,
} from './DocumentsViewerHeader.types'

const DocumentsViewerHeader = ({
  handleDownload,
  handleZoomReset,
  handleZoomIn,
  handleZoomOut,
  showZoom = true,
}: DocumentsViewerHeaderProps) => {
  return (
    <Wrapper>
      {handleDownload && (
        <DownloadButton
          onClick={handleDownload}
          title={"Descargar"}
        >
          <IconCta
            Icon={CloudArrowDownIcon}
            variant='defaultBlack24'
          />
        </DownloadButton>
      )}

      {showZoom && (
        <>
          <ZoomButton
            onClick={handleZoomOut}
            title={'Disminuir vista'}
          >
            <IconCta
              Icon={MagnifyingGlassMinusIcon}
              variant='defaultBlack24'
            />
          </ZoomButton>

          <ZoomButton
            onClick={handleZoomIn}
            title={'Aumentar vista'}
          >
            <IconCta
              Icon={MagnifyingGlassPlusIcon}
              variant='defaultBlack24'
            />
          </ZoomButton>

          <ZoomButton
            onClick={handleZoomReset}
            title={'Restablecer vista'}
          >
            <IconCta
              Icon={ArrowPathIcon}
              variant='defaultBlack24'
            />
          </ZoomButton>
        </>
      )}
    </Wrapper>
  )
}

export default DocumentsViewerHeader