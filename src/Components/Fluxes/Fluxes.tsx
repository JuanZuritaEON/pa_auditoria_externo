import { useCallback, useEffect, useRef, useState } from 'react'
import {
  apiSlice,
  ContentType,
  fluxDataColumns,
  fluxExtensions,
  RootState,
  S3IDocumentGeneralType,
  S3Slice,
  SAVE_APP_FLUX,
  SAVE_ERRORS,
  Texts,
  useAppDispatch,
  useAppSelector
} from '../../Redux'
import { Alert, Button, Modal, Table, Typography, DocViewer, Input, FileUpload, ProgressIcon, GlobalMessage, Loader } from '..'
import { getFileType, getIconPerStatus, multipartS3Upload, obtainOptimalChunk, sendAppError, sendToastMessage } from '../../Utils'
import UserAuth from './UserAuth/UserAuth'
import { isNull } from 'lodash'
import './Fluxes.css'

const Fluxes = () => {
  const dispatch = useAppDispatch()
  const {
    app: {
      appFluxContext: {
        authCancel,
        activeFileUpload,
        consultant: {companyName, shortName},
        fluxes: { dataFluxes, flagAuth, countFluxes: {approved,pending,rejected} },
        liferayUser: { data: {numOtorgante, nameUser} },
        mediaAll,
        progress,
        uploadLoader
      }
    },
    apiRequest: {queries}
  } = useAppSelector((state: RootState) => state)
  const { getFluxesInfo } = apiSlice.endpoints
  const { initMultipartS3, uploadChunks, closeMultipartS3, abortMultipartS3, s3UploadFile } = S3Slice.endpoints
  const [activeModal, setActiveModal] = useState(false)
  const [auth, setAuth] = useState(flagAuth !== 0)
  const [auditType, setAuditType] = useState('')
  const [multiFile, setMultiFile] = useState<File[] | null>(null)
  const [loader, setLoader] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toastID = useRef<any>(null)

  const handleModal = () => {
    setMultiFile(null)
    setAuditType('')
    setFileLoading(false)
    setActiveModal(true)
  }

  const handleDeleteFile = (nameFile: string) => {
    if (!multiFile) return
    const filterFiles = multiFile.filter(file => file.name !== nameFile)
    setMultiFile(filterFiles.length ? filterFiles : null)
  }

  const handleReloadTable = useCallback(async () => {
    try {
      setLoader(true)
      const { data, isSuccess, isError, error } = await dispatch(getFluxesInfo.initiate({
        numeroOtorgante: numOtorgante
      }, { forceRefetch: true }))
      if (isSuccess) dispatch(SAVE_APP_FLUX({ fluxes: data, noContent: data.allConsults === 0 }))
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      sendAppError(error)
    } finally { setLoader(false) }
  }, [dispatch, getFluxesInfo, numOtorgante])

  const showDocs = () => {
    if (isNull(multiFile)) return null
    const docs = multiFile.map(file => {
      return ({
        uri: window.URL.createObjectURL(file),
        fileName: file.name,
        fileType: ContentType[`${getFileType(file.type)}_TYPE` as keyof typeof ContentType],
        fileGeneralType: S3IDocumentGeneralType.FILE
      })
    })
    return <DocViewer documents={docs} loading={fileLoading} handleDelete={handleDeleteFile} />
  }
  const showTable = () => {
    if (dataFluxes[0].fluxID === 0) return <Alert type='info' className='alertNoFluxes' text={Texts.NO_INFO_FLUXES} />
    return <Table
      alertText={flagAuth === 0 ? Texts.ALERT_FLUX : ''}
      columns={fluxDataColumns}
      data={dataFluxes.map(flux => ({
        ...flux,
        fluxStatus: <div
        className='specialCustomButton'
        title={flux.fluxStatus}>
          <img src={getIconPerStatus(flux.fluxStatus)} alt={flux.fluxStatus} />
        </div>,
      }))}
      reloadTable={handleReloadTable}
      subHeader
      totalRows={approved + rejected + pending}
    />
  }

  const prepareFiles = (files: File[]) => {
    try {
      setFileLoading(true)
      let fileList = [...files]
      if (multiFile?.length) fileList = [...multiFile, ...fileList]
      setMultiFile(fileList)
    } catch (error) {
      sendAppError(error)
    }
  }

  const handleSendFiles = async () => {
    try {
      if (!multiFile) return
      multiFile.sort((file) => {
        if (file.name.toLowerCase().includes('.mp4')) return 1
        return -1
      })
      dispatch(SAVE_APP_FLUX({ uploadLoader: true }))
      for (const file of multiFile) {
        if (file.name.toLowerCase().includes('.mp4')) {
          await multipartS3Upload(
            dispatch,
            file,
            {
              numOtorgante: numOtorgante,
              tipoAuditoria: (parseInt(auditType)+1000).toString(),
              esMasivo: '0',
              folioCDC: '0',
              nombre: file.name
            },
            {
              init: initMultipartS3,
              upload: uploadChunks,
              close: closeMultipartS3,
              abort: abortMultipartS3
            },
            obtainOptimalChunk(file.size),
          )
          continue
        }
        const s3Promise = dispatch(s3UploadFile.initiate({
          numOtorgante: numOtorgante,
          tipoAuditoria: (parseInt(auditType)+1000).toString(),
          esMasivo: '0',
          folioCDC: '0',
          nombre: file.name,
          file
        }))
        const { isSuccess, isError, error } = await s3Promise
        if (isSuccess) {
          setActiveModal(false)
          handleReloadTable()
        }
        if (isError) {
          dispatch(SAVE_APP_FLUX({ uploadLoader: false }))
          dispatch(SAVE_ERRORS([error]))
        }
      }
    } catch (error) {
      sendAppError(error)
    }
  }

  useEffect(() => {
    if (progress === 0 && uploadLoader && activeFileUpload) {
      toastID.current = sendToastMessage({
        icon: <ProgressIcon progress={progress} />,
        optionalComponent: <GlobalMessage>
          <span>Subiendo archivo: {activeFileUpload}</span>
          <span>* Evita salir o recargar la pagina.</span>
        </GlobalMessage>,
        type: 'success',
        position: 'bottom-right',
        progress: progress,
        hideProgressBar: false,
        closeButton: false,
        closeOnClick: false,
        theme: 'light'
      })
      dispatch(SAVE_APP_FLUX({ toastID: toastID.current }))
    }
  }, [activeFileUpload, progress, uploadLoader, dispatch])

  useEffect(() => {
    if (queries.hasOwnProperty(`getFluxesInfo({"numeroOtorgante":"${numOtorgante}"})`)) return
    (auth || authCancel) && handleReloadTable()
  }, [dispatch, auth, authCancel, queries, numOtorgante, handleReloadTable])


  return (
    <section>
      {
        (!auth && !authCancel) ? <UserAuth
          userName={nameUser}
          companyName={companyName}
          numOtorgante={numOtorgante}
          shortName={shortName}
          setAuth={setAuth}
          setActiveModal={setActiveModal}
          setAuditType={setAuditType}
        /> : (
          <>
            {
              loader ? <Loader wrapperClass='generalLoader' width={60} height={60} /> : (
                <>
                  <div className='fluxesFigures'>
                    <Button type='button' variant='primary' onClick={handleModal}>
                      Nueva Carga +
                    </Button>
                    <Typography typo={<>Aprobados: <b>{approved}</b></>} />
                    <Typography typo={<>Rechazados: <b>{rejected}</b></>} />
                    <Typography typo={<>En revisión: <b>{pending}</b></>} />
                  </div>
                  <div className='separatorLineSpace'/>
                  {showTable()}
                </>
              )
            }
          </>
        )
      }
      <Modal
        activeModal={{ active: activeModal, setActive: setActiveModal }}
        title={`Nueva Carga de Flujo`}
        onAccept={handleSendFiles}
        noFooter={uploadLoader}
      >
        {!uploadLoader ? <section className='fileUploadedModalWindow'>
          <Input
            id="auditTypeSelect"
            labelText='Tipo de auditoría'
            title='Tipo de auditoría'
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => e.preventDefault()}
            onChange={(value: any) => {
              setAuditType(value)
              setFileLoading(true)
              setMultiFile(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            type='select'
            options={(!auth && !authCancel) ?
              mediaAll.filter(m=>m.idMedia==='8').map(m=>({id:m.idMedia,desc:m.descMedia})) :
              mediaAll.map(media => ({id: media.idMedia, desc: media.descMedia}))}
            value={auditType}
          />
          <FileUpload
            acceptedFiles={fluxExtensions}
            disabled={!auditType}
            id='fileUpload'
            inputRef={inputRef}
            isMultiple
            label={multiFile ? multiFile[0].name : 'Elige tu archivo'}
            onChange={prepareFiles}
          />
          {showDocs()}
        </section> : <Alert className='customFileAlert' type='warning' text={Texts.ACTIVE_LOAD} />}
      </Modal>
    </section>
  )
}

export default Fluxes