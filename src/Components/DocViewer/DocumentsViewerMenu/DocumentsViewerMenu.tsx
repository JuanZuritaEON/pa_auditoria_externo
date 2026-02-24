import { TrashIcon } from '@heroicons/react/24/outline'
import { memo } from 'react'
import { IconCta } from '../..'
import {
  FileDescription,
  FileName,
  Header,
  Item,
  Items,
  Wrapper,
} from './DocumentsViewerMenu.styles'
import { DocumentsViewerMenuProps } from './DocumentsViewerMenu.types'

const DocumentsViewerMenu = ({
  activeDocument,
  documents,
  handleChangeDocument,
  handleRemoveDocument,
}: DocumentsViewerMenuProps) => {
  const { length } = documents
  const header = length === 1 ?
    `${length} archivo` :
    `${length} archivos`

  if (length < 1) return null

  return (
    <Wrapper data-testid='documents-viewer-menu'>
      <Header>
        {header}
      </Header>

      <Items>
        {documents?.map((document, index) => {
          const { fileName } = document
          const isActive = fileName === activeDocument.fileName
          
          return (
            <Item
              key={`file-data-${document.fileName}`}
              onClick={() => handleChangeDocument(fileName)}
              title={fileName}
              $isActive={isActive}
            >
              <FileName>
                {fileName}
              </FileName>

              <FileDescription>
                {`${index + 1} / ${length}`}
              </FileDescription>

              {handleRemoveDocument && (
                <IconCta
                  Icon={TrashIcon}
                  alignSelf='flex-end'
                  aria-label={'Eliminar'}
                  onClick={() => handleRemoveDocument(document.fileName)}
                  variant='defaultBlack20'
                />
              )}
            </Item>
          )
        })}
      </Items>
    </Wrapper>
  )
}

export default memo(DocumentsViewerMenu)