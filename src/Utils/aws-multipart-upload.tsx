import { S3MultipartProps, SAVE_APP_FLUX, SAVE_ERRORS } from '../Redux'
import { sendToastMessage } from "./helpers"

const S3Upload: S3MultipartProps = async (
  dispatch,
  file,
  params,
  s3Actions,
  chunks
) => {
  try {
    const { init, upload, close, abort } = s3Actions
    const { chunkSize: partSize, totalParts: totalChunks } = chunks
    const chunkProgress = (100 / totalChunks.length) / 100
    let chunkNumber = 0
    let start = chunkNumber * partSize;
    let end = Math.min(start + totalChunks[0], file.size);
    let etagsArray = [{
      PartNumber: 0,
      ETag: ''
    }]
    const initMultipartPromise = dispatch(init.initiate({ ...params, partes: totalChunks.length }, { forceRefetch: true }))
    const { data, isSuccess, isError, error }  = await initMultipartPromise
    if (isSuccess) {
      dispatch(SAVE_APP_FLUX({
        activeFileUpload: file.name,
        saveMultipartData: {
          Bucket: data.Bucket,
          UploadId: data.UploadId,
          Key: data.Key,
        }
      }))
      const uploadChunks = async () => {
        if (chunkNumber < totalChunks.length){
          const chunk = file.slice(start, end)
          const uploadChunkPromise = dispatch(upload.initiate({ url: data.urls[chunkNumber].url, chunk }, { forceRefetch: true }))
          const { data: etag, isSuccess, isError, error } = await uploadChunkPromise
          if (isSuccess) {
            etagsArray = [...etagsArray, { PartNumber: chunkNumber + 1, ETag: etag }]
            dispatch(SAVE_APP_FLUX({ progress: Number((chunkNumber + 1) * chunkProgress) }))
            chunkNumber++
            start = end
            end = Math.min(start + totalChunks[chunkNumber], file.size)
            await uploadChunks()
          }
          if (isError) {
            dispatch(SAVE_ERRORS([error]))
            await dispatch(abort.initiate({
              Bucket: data.Bucket,
              UploadId: data.UploadId,
              Key: data.Key,
            }, { forceRefetch: true }))
            dispatch(SAVE_APP_FLUX({
              activeFileUpload: '',
              abortSignalS3: true,
              progress: 0,
              uploadLoader: false,
              toastID: null
            }))
          }
        } else {
          etagsArray.shift()
          const { isSuccess, isError, error } = await dispatch(close.initiate({
            Bucket: data.Bucket,
            UploadId: data.UploadId,
            Key: data.Key,
            Tags: etagsArray
          }, { forceRefetch: true }))
          if (isSuccess) {
            dispatch(SAVE_APP_FLUX({
              activeFileUpload: '',
              progress: 0,
              uploadLoader: false,
              toastID: null
            }))
            sendToastMessage({
              message: `El archivo "${file.name}" se envió con éxito.`,
              type: 'success',
              closeTimer: 4000,
              position: 'bottom-right'
            })
          }
          if (isError) {
            dispatch(SAVE_ERRORS([error]))
            dispatch(SAVE_APP_FLUX({
              activeFileUpload: '',
              progress: 0,
              uploadLoader: false,
              toastID: null
            }))
          }
        }
      }
      await uploadChunks()
    }
    if (isError) {
      dispatch(SAVE_ERRORS([error]))
      dispatch(SAVE_APP_FLUX({
        activeFileUpload: '',
        progress: 0,
        uploadLoader: false,
        toastID: null
      }))
    }
  } catch (error) {
    dispatch(SAVE_ERRORS([error]))
  } finally {
    dispatch(SAVE_APP_FLUX({
      activeFileUpload: '',
      progress: 0,
      uploadLoader: false,
      toastID: null
    }))
  }
}

export default S3Upload