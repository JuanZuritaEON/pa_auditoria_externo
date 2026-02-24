import { useRef, useState, useEffect, useCallback } from 'react'
import { apiSlice, massiveDataColumns, MassiveUploadTabs, nipCiecExtensions, RootState, S3Slice, SAVE_APP_FLUX, SAVE_ERRORS, SubTabsInfo, Texts, useAppDispatch, useAppSelector, zipExtension } from '../../Redux'
import { ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentChartBarIcon, FolderArrowDownIcon } from '@heroicons/react/16/solid'
import { Alert, Button, FileUpload, GlobalMessage, Input, Loader, Modal, NoTableRecords, ProgressIcon, SubTabs, Table, Typography } from '..'
import { multipartS3Upload, obtainOptimalChunk, sendAppError, sendToastMessage, formatNumber, downloadFile } from '../../Utils'
import { isEmpty, isNull } from 'lodash'
import './MassiveUpload.css'

const MassiveUpload = () => {
  const dispatch = useAppDispatch()
  const {
    app: {
      appFluxContext: {
        activeFileUpload,
        consultant: {media},
        liferayUser: { data: {numOtorgante} },
        progress,
        statusMassive,
        uploadLoader
      },
    },
    apiRequest: {queries}
  } = useAppSelector((state: RootState) => state)
  const { downloadMassiveFileReport, getMassiveFileInfo } = apiSlice.endpoints
  const { initMultipartS3, uploadChunks, closeMultipartS3, abortMultipartS3 } = S3Slice.endpoints
  const [subTab, setSubTab] = useState<MassiveUploadTabs>('upload')
  const [activeModal, setActiveModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const toastID = useRef<any>(null)
  const [fileReport, setFileReport] = useState({ name:'', data: '' })
  const [loadingReport, setLoadingReport] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [auditType, setAuditType] = useState('')
  const isNipOrCiec = auditType === '6' || auditType === '10'

  const clearFields = () => {
    setAuditType('')
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSendFile = async () => {
    try {
      if (!file) return
      dispatch(SAVE_APP_FLUX({ uploadLoader: true }))
      await multipartS3Upload(
        dispatch,
        file,
        {
          numOtorgante: numOtorgante,
          tipoAuditoria: auditType,
          esMasivo: '1',
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
    } catch (error) {
      sendAppError(error)
    } finally { clearFields() }
  }

  const handleDownloadReport = async (fileName: string, id: number) => {
    try {
      setActiveModal(true)
      setLoadingReport(true)
      setFileReport({ name:'', data: '' })
      setModalTitle(`Reporte ${fileName}`)
      const fileReportPromise = dispatch(downloadMassiveFileReport.initiate({ id }, { forceRefetch: true }))
      const { data, isSuccess, isError, error } = await fileReportPromise
      if (isSuccess) setFileReport({ name: `${numOtorgante}_Reporte_Folios_Archivo_${fileName}.xlsx`, data })
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      dispatch(SAVE_ERRORS([error]))
    } finally { setLoadingReport(false) }
  }

  const handleReloadTable = useCallback(async () => {
    try {
      setLoadingReport(true)
      const { data, isSuccess, isError, error } = await dispatch(getMassiveFileInfo.initiate({
        numeroOtorgante: numOtorgante
      }, { forceRefetch: true }))
      if (isSuccess) dispatch(SAVE_APP_FLUX({ statusMassive: data, noInfoRequest: data.length === 0 }))
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      sendAppError(error)
    } finally { setLoadingReport(false) }
  }, [dispatch, getMassiveFileInfo, numOtorgante])

  const showTable = () => {
    if (loadingReport) return <Loader wrapperClass='generalLoader' width={90} height={90} />
    if (statusMassive.length === 1 && statusMassive[0].idStatus === 0) return <NoTableRecords message={Texts.NO_MASSIVE_REPORTS} reload={handleReloadTable} />
    return (
      <Table
        alertText='Los nuevos archivos tardan aproximadamente 24 h en procesarse.'
        columns={massiveDataColumns}
        data={statusMassive.map(list => ({
          ...list,
          totalFolios: <div title={list.totalFolios.toString()} className='foliosCustomDiv foliosTotal'>
            {formatNumber.format(list.totalFolios)}
          </div>,
          totalCorrect: <div title={list.totalCorrect.toString()} className='foliosCustomDiv foliosCorrect'>
            {formatNumber.format(list.totalCorrect)}
          </div>,
          totalIncorrect: <div title={list.totalIncorrect.toString()} className='foliosCustomDiv foliosIncorrect'>
            {formatNumber.format(list.totalIncorrect)}
          </div>,
          report: <Button
          onClick={() => list.report ? null : handleDownloadReport(list.fileName, list.idStatus)}
          className={'downloadReportButton'}
          title='Reporte'>
            <ArrowDownTrayIcon
              title={'Reporte'}
              className='iconStandardStyle svgFill'
            />
          </Button>
        }))}
        reloadTable={handleReloadTable}
        subHeader
        totalRows={statusMassive.length}
      />
    )
  }

  const renderInputAlerts = () => {
    if (uploadLoader) return <Alert className='alertFileError' type='warning' text={Texts.ACTIVE_LOAD} />
    return (
      <>
        <Input
          id="auditTypeSelect"
          labelText='Tipo de auditoría'
          title='Tipo de auditoría'
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => e.preventDefault()}
          onChange={(value: any) => {
            setAuditType(value)
            setFile(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
          type='select'
          options={media.map(media => ({id: media.idMedia, desc: media.descMedia}))}
          value={auditType}
        />
        <FileUpload
          acceptedFiles={isNipOrCiec ? nipCiecExtensions : zipExtension}
          disabled={!auditType}
          id='fileUpload'
          inputRef={inputRef}
          label={!isNull(file) ? file.name : 'Elige tu archivo'}
          onChange={(files: FileList) => setFile(files[0])}
        />
        <div className='buttonsContent'>
          <Button type='button' variant='outline-primary' onClick={clearFields}>
            <Typography typo='Limpiar Selección' />
          </Button>
          <Button type='button' variant='primary' onClick={handleSendFile}>
            <Typography typo='Enviar' />
          </Button>
        </div>
      </>
    )
  }

  const subTabs: SubTabsInfo<MassiveUploadTabs> = [
    {
      id: 'upload',
      name: 'Subir Archivo',
      icon: <ArrowUpTrayIcon
        title={'Upload'}
        className='iconStandardStyle svgFill'
      />
    },
    {
      id: 'consult',
      name: 'Consultar Registros',
      icon: <DocumentChartBarIcon
        title={'Consult'}
        className='iconStandardStyle svgFill'
      />
    }
  ]

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

  useEffect(() =>  {
    if(queries.hasOwnProperty(`getMassiveFileInfo({"numeroOtorgante":"${numOtorgante}"})`)) return
    subTab === 'consult' && handleReloadTable()
  }, [subTab, queries, numOtorgante, handleReloadTable])

  return (
    <>
      <SubTabs<MassiveUploadTabs> subTabActual={subTab} setTab={setSubTab} tabs={subTabs} />
      {subTab === 'upload' ? <section className='containerMassive'>
        {renderInputAlerts()}
      </section> : showTable()}
      <Modal
        activeModal={{ active: activeModal, setActive: setActiveModal }}
        title={modalTitle}
        noFooter
      >
        {
          loadingReport ? <Loader wrapperClass='generalLoader' width={60} height={60} /> :
          <>
            {isEmpty(fileReport.data) ? <Alert text={Texts.ERROR_FILE_DOWNLOAD} type='danger' className='alertFileError' /> : (
            <Button
              type='button'
              variant='primary'
              classnames='downloadModalFile'
              onClick={() => downloadFile({fileName:fileReport.name,url:fileReport.data})}
            >
              <FolderArrowDownIcon />
              <Typography typo={fileReport.name} />
            </Button>
            )
            }
          </>
        }
      </Modal>
    </>
  )
}

export default MassiveUpload