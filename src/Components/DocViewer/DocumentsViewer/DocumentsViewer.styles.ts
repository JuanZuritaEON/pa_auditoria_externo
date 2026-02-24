import styled from 'styled-components'
import { DocumentsViewerCSS } from './DocumentsViewer.types'
import { Palette } from '../../../Redux'

const boxShadow = ({
  $showMenu,
}: DocumentsViewerCSS) => (
  $showMenu ?
    `0px 0px 5px ${Palette.GREY_1_COLOR}` :
    undefined
)

export const Wrapper = styled.div<DocumentsViewerCSS>`
  display: flex;
  flex-direction: row;
  width: 100%;

  #proxy-renderer {
    box-shadow: ${boxShadow};
  }
`

export const Viewer = styled.div<{ zoom: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;

  img {
    transform: ${({ zoom }: {zoom: number}) => `scale(${zoom})`};
    transform-origin: top left;
  }
`