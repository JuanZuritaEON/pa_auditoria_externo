import { S3IDocument } from '../../../Redux'

export type DocumentsViewerMenuProps = {
  activeDocument: S3IDocument
  documents: S3IDocument[]
  handleChangeDocument: (index: string) => void
  handleRemoveDocument?: (documentName: string) => void
}