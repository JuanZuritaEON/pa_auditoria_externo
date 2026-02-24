import { AxiosResponseError, S3IDocument } from '../../Redux'

export type UseDocumentsViewerParams = {
  documents: S3IDocument[]
  loading: boolean
  error?: null | AxiosResponseError
}
