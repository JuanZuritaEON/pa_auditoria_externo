import { useEffect, useRef, useState } from 'react'
import {
  apiSlice,
  audioExtensions,
  ButtonFigsIcons,
  consultsDataColumns,
  ContentType,
  CustomButtonFigsClasses,
  mediaType,
  NormalObject,
  RootState,
  S3IDocumentGeneralType,
  S3Slice,
  SAVE_APP_FLUX,
  SAVE_ERRORS,
  standardFileExtensions,
  Texts,
  Titles,
  useAppDispatch,
  useAppSelector
} from '../../Redux'
import { assignPeriodDate, downloadFile, formatNumber, getFileIcons, getFileType, getHasFileText, getIconPerStatus, multipartS3Upload, obtainOptimalChunk, sendAppError, sendToastMessage } from '../../Utils'
import { Alert, Button, FileUpload, GlobalMessage, Graph, Input, Loader, Modal, ProgressIcon, Table, Typography } from '..'
import { FolderArrowDownIcon } from '@heroicons/react/16/solid'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { DocViewer } from '../DocViewer'
import { PDFDocument } from 'pdf-lib'
import { isEmpty } from 'lodash'
import './Consults.css'

const Consults = () => {
  const dispatch = useAppDispatch()
  const {
    appFluxContext: {
      activeFileUpload,
      controlFigs,
      consultant: {type, media},
      consultsList,
      liferayUser: {data: {numOtorgante, userId}},
      progress,
      selectedDates,
      tableLoader,
      totalTableRows,
      uploadLoader
    }
  } = useAppSelector((state: RootState) => state.app)
  const {
    s3UploadFile,
    initMultipartS3,
    uploadChunks,
    closeMultipartS3,
    abortMultipartS3
  } = S3Slice.endpoints
  const [auditType, setAuditType] = useState('')
  const [tableTitle, setTableTitle] = useState('')
  const [cdcNumber, setCdcNumber] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [activeModal, setActiveModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [fileReport, setFileReport] = useState({ name:'', data: '' })
  const [dictamenRec, setDictamenRec] = useState({ dictamenName: '', dataBase64: '' })
  const [loadingReport, setLoadingReport] = useState(false)
  const [specialRequest, setSpecialRequest] = useState(false)
  const { getConsultsList, specialConsultNewRequest, getControlFigs, downloadConsultsReport, downloadDictamen } = apiSlice.endpoints
  const tableRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toastID = useRef<any>(null)

  let figsArray: NormalObject[] = [{name:'',value:0}]
  for (const [key, value] of Object.entries(controlFigs)) {
    figsArray = [...figsArray, {
      name: key,
      value
    }]
  }
  const controlFigsUpdated = figsArray.slice(2, figsArray.length - 1).map((fig, index) => ({
    name: Titles[index],
    value: fig.value
  }))

  const handleModalInfo = (cdc: string) => {
    setAuditType('')
    setFile(null)
    setCdcNumber(cdc)
    setModalTitle(`Subir archivo para el Folio: ${cdc}`)
    setActiveModal(true)
  }

  const handleGetConsults = async ({ name, value }: NormalObject) => {
    try {
      dispatch(SAVE_APP_FLUX({ noContent: false, tableLoader: true }))
      setTableTitle(`${name === 'Requeridas' ? 'Total Muestra' : 'Firmas ' + name}`)
      const consultsPromise = dispatch(getConsultsList.initiate({
        numeroOtorgante: numOtorgante,
        estatus: `total${name.split(' ')[0]}`,
        fechaFin: selectedDates.endDate,
        fechaInicio: selectedDates.startDate,
        tipoOtorgante: type
      }, { forceRefetch: true }))
      const { data, isSuccess, isError, error }  = await consultsPromise
      if (isSuccess) {
        dispatch(SAVE_APP_FLUX({
          consultsList: data,
          noContent: data.length === 0,
          totalTableRows: value
        }))
      }
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      sendAppError(error)
    } finally { dispatch(SAVE_APP_FLUX({ tableLoader: false })) }
  }

  const prepareFiles = async (files: FileList) => {
    try {
      const file = files[0]
      const isFAD = auditType === '9'
      const isEFIRM = auditType === '11'
      if (file.name.split('.')[0] !== cdcNumber) {
        sendToastMessage({ message: 'El nombre del archivo debe coincidir con el numero de folio.', type: 'error' })
        if (inputRef.current) inputRef.current.value = ''
        return
      }
      if (file.type.includes('pdf')) {
        const obtainPages = async () => {
          const fileArrayBuffer = await file.arrayBuffer()
          const pdfDoc = await PDFDocument.load(fileArrayBuffer)
          const numberOfPages = pdfDoc.getPageCount()
          return numberOfPages
        }
        const numberOfPages = await obtainPages()
        const eFirmPages = isEFIRM ? numberOfPages <= 2 : numberOfPages === 1
        const verifyMaxPages = (isFAD ? numberOfPages <= 15 : eFirmPages)
        if (!verifyMaxPages) {
          sendToastMessage({
            optionalComponent: 
            <GlobalMessage>
              <span>- Por favor procura sólo subir las páginas necesarias para la auditoría -</span>
              <span>Firma Autógrafa: 1 Máx</span>
              <span>EFirma: 2 Máx</span>
              <span>FAD: 15 Máx</span>
            </GlobalMessage>,
            type: 'warning',
            closeTimer: 5000,
          })
          if (inputRef.current) inputRef.current.value = ''
          return
        }
      }
      setFile(file)
    } catch (error) {
      sendAppError(error)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleSendFiles = async () => {
    try {
      if (!file) return
      dispatch(SAVE_APP_FLUX({ uploadLoader: true }))
      if (auditType === '14') {
        await multipartS3Upload(
          dispatch,
          file,
          {
            numOtorgante: numOtorgante,
            tipoAuditoria: auditType,
            esMasivo: '0',
            folioCDC: cdcNumber,
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
      } else {
        const s3Promise = dispatch(s3UploadFile.initiate({
          numOtorgante: numOtorgante,
          tipoAuditoria: auditType,
          esMasivo: '0',
          folioCDC: cdcNumber,
          nombre: file.name,
          file
        }, { forceRefetch: true }))
        const { isSuccess, isError, error } = await s3Promise
        if (isSuccess) {
          setActiveModal(false)
          dispatch(SAVE_APP_FLUX({ uploadLoader: false, noContent: false, loadingData: true }))
          const { data, isSuccess, isError, error } = await dispatch(getControlFigs.initiate({
            numeroOtorgante: numOtorgante,
            fechaInicio: selectedDates.startDate,
            fechaFin: selectedDates.endDate
          }, { forceRefetch: true }))
          if (isSuccess) {
            dispatch(SAVE_APP_FLUX({
              controlFigs: data,
              noContent: data.allConsults === 0,
              loadingData: false
            }))
          }
          if (isError) dispatch(SAVE_ERRORS([error]))
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

  const handleGetReportTable = async () => {
    try {
      setActiveModal(true)
      setLoadingReport(true)
      setFileReport({ name:'', data: '' })
      setDictamenRec({ dictamenName: '', dataBase64: '' })
      setModalTitle(`Reporte ${tableTitle}`)
      const status = tableTitle.split(' ')[1]
      const fileReportPromise = dispatch(downloadConsultsReport.initiate({
        numeroOtorgante: numOtorgante,
        estatus: `total${status === 'Muestra' ? 'Requeridas' : status}`,
        fechaFin: selectedDates.endDate,
        fechaInicio: selectedDates.startDate,
        tipoOtorgante: type
      }))
      const { data, isSuccess, isError, error } = await fileReportPromise
      if (isSuccess) setFileReport({ name: `${numOtorgante}_Reporte_Consultas_${tableTitle.split(' ').join('_')}.xlsx`, data })
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      dispatch(SAVE_ERRORS([error]))
    } finally { setLoadingReport(false) }
  }

  const handleSpecialRequest = async () => {
    try {
      setLoadingReport(true)
      const payload = {
        fechaInicio: selectedDates.startDate,
        fechaFin: selectedDates.endDate,
        numeroOtorgante: numOtorgante,
        estatus: mediaType.filter(media => media.descMedio.includes(tableTitle.split(' ')[1]))[0].claveMedio,
        tipoOtorgante: type,
        userId: userId
      }
      const { isSuccess, isError, error } = await dispatch(specialConsultNewRequest.initiate(payload))
      if (isSuccess) {
        setActiveModal(false)
        dispatch(SAVE_APP_FLUX({ actualTab: Texts.SPECIAL_REQUESTS, specialRequestTopCall: true }))
        sendToastMessage({
          message: `La solicitud se realizó con éxito.`,
          type: 'success',
          closeTimer: 4500,
          position: 'bottom-right'
        })
        setLoadingReport(false)
      }
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      setLoadingReport(false)
      sendAppError(error)
    }
  }

  const handleGetDictamen = async () => {
    try {
      setActiveModal(true)
      setLoadingReport(true)
      setModalTitle('Dictamen')
      setFileReport({ name:'', data: '' })
      const periodDate = assignPeriodDate({ fechaInicio: selectedDates.startDate }).split('/')
      const payload = {
        numeroOtorgante: numOtorgante,
        año: periodDate[1],
        mes: periodDate[0].toLocaleUpperCase()
      }
      const dictamenPromise = dispatch(downloadDictamen.initiate(payload))
      const {data, isSuccess, isError, error} = await dictamenPromise
      if (isSuccess) setDictamenRec({ dictamenName: 'Dictamen', dataBase64: data })
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      dispatch(SAVE_ERRORS([error]))
    } finally { setLoadingReport(false) }
  }

  const render = () => isEmpty(consultsList[0].cdcFolio) ? null : (
    <>
      <div className='separatorLineSpace'/>
      <Table
        columns={consultsDataColumns}
        data={consultsList.map(list => ({
          ...list,
          status: <div
          className='specialCustomButton'
          title={list.status}>
            <img src={getIconPerStatus(list.status)} alt={list.status} />
          </div>,
          hasFile: <Button
          onClick={() => (list.hasFile && !list.allowUpdate) ? null : handleModalInfo(list.cdcFolio)}
          className={`specialCustomButton ${(list.hasFile && !list.allowUpdate) ? 'documentValid' : 'fileUploadLabel'}`}
          title={getHasFileText((list.hasFile && !list.allowUpdate))}>
            <img src={getFileIcons((list.hasFile && !list.allowUpdate) )} alt={getHasFileText((list.hasFile && !list.allowUpdate) )} />
            <Typography typo={(list.hasFile && !list.allowUpdate)  ? 'OK' : 'Actualizar'} size='sm' variant='light' />
          </Button>
        }))}
        downloadReport={totalTableRows <= 20000 ? handleGetReportTable : () => {
          setActiveModal(true)
          setCdcNumber('0')
          setSpecialRequest(true)
          setModalTitle(`Reporte ${tableTitle}`)
        }}
        subHeader
        tableRef={tableRef}
        title={tableTitle}
        totalRows={totalTableRows}
      />
    </>
  )

  const showCustomModalBody = () => {
    if (loadingReport) return <Loader wrapperClass='generalLoader' width={60} height={60} />
    if (dictamenRec.dictamenName) return (
            <Button
        type='button'
        variant='primary'
        classnames='downloadModalFile'
        onClick={() => downloadFile({fileName: `${dictamenRec.dictamenName}.pdf`, url: dictamenRec.dataBase64 })}
      >
        <FolderArrowDownIcon />
        <Typography typo={`${dictamenRec.dictamenName}.pdf`} />
      </Button>
/*       <section className='fileUploadedModalWindow visorOnly'>
        <DocViewer documents={[{
              fileName: dictamenRec.dictamenName,
              fileType: ContentType.PDF_TYPE,
              fileGeneralType: S3IDocumentGeneralType.FILE,
              isAudio: false,
              uri: `data:application/pdf;base64,${dictamenRec.dataBase64}`,
            }]} />
      </section> */
    )
    if (specialRequest) return (
      <div className='specialConsult'>
        <Typography typo={<b>Solicitud: {tableTitle}</b>} />
        <Typography
          typo={'El reporte supera los "20,000" registros, por ello la consulta se llevara a cabo mediante "Solicitud Especial", puedes visualizar el Estatus de la Solicitud en la sección de - Solicitudes Especiales > Consultar Estatus -.'}
        />
        <Typography
          typo={<b>Da click en "Enviar" para realizar la Solicitud Especial.</b>}
        />
      </div>
    )
    if (!loadingReport && fileReport.name && fileReport.data && !cdcNumber) return (
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
    else if (!loadingReport && !fileReport.data && !cdcNumber) return <Alert text={Texts.ERROR_FILE_DOWNLOAD} type='danger' className='alertFileError' />
    return (
      <section className='fileUploadedModalWindow'>
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
          options={media.filter((media) => media.idMedia !== 6 && media.idMedia !== 10).map(media => ({id: media.idMedia, desc: media.descMedia}))}
          value={auditType}
        />
        <FileUpload
          acceptedFiles={auditType === '14' ? audioExtensions : standardFileExtensions}
          disabled={!auditType}
          id='fileUpload'
          inputRef={inputRef}
          label={file ? file.name : 'Elige tu archivo'}
          onChange={prepareFiles}
          maxSize={(auditType === '8' || auditType === '9') ? 1 : null} //En MB
        />
        {file ? <DocViewer documents={[{
          fileName: file.name,
          fileType: ContentType[`${getFileType(file.type)}_TYPE` as keyof typeof ContentType],
          fileGeneralType: S3IDocumentGeneralType.FILE,
          isAudio: auditType === '14',
          uri: window.URL.createObjectURL(file),
        }]} /> : null }
      </section>
    )
  }

  useEffect(() => {
    if (tableRef.current) {tableRef.current.scrollIntoView({ behavior: 'smooth' })}
  }, [tableLoader])
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
    dispatch(SAVE_APP_FLUX({ consultsList: [{
      cdcFolio: '',
      hasFile: false,
      statusKey: '',
      productKey: '',
      status: '',
      consultDate: '',
      consultantFolio: '',
      nameClient: '',
      signNumber: '',
      product: '',
      rejectReason: '',
      remarks: '',
      allowUpdate: false
    }]}))
  }, [dispatch])

  return (
    <>
      <section className='consultsContent'>
        <Graph
          allConsults={controlFigs.allConsults}
          controlFigs={controlFigsUpdated}
          required={controlFigs.required}
          onClickAnchor={handleGetConsults}
          type={type}
        />
        <div className='figsButtons'>
          {controlFigsUpdated.map((fig, index) => (
            <Button
              key={fig.name}
              size='lg'
              classnames={`
                singleFigButton
                ${index === 0 ? 'upButtonEdges' : ''}
                ${index === controlFigsUpdated.length - 1 ? 'bottomButtonEdges' : ''}
              `}
              onClick={() => fig.value === 0 ? null : handleGetConsults(fig)}
            >
              <img src={ButtonFigsIcons[index]} alt={fig.name} className='iconMargin' />
              <Typography typo={`Firmas ${fig.name}`} classNames='textStyles' size='sm' variant='bold' />
              <Typography typo={formatNumber.format(fig.value)} size='lg' classNames={`${CustomButtonFigsClasses[index]} figureStyle`} />
            </Button>
          ))}
          {controlFigs.required > 0 ? 
            <Button
              size='sm'
              isLink
              variant='outline-primary'
              classnames={`dictamenButton`}
              onClickAnchor={handleGetDictamen}
            >
              <Typography typo={'Dictamen'}/>
              <DocumentIcon
                title={'Dictamen'}
                className='iconStandardStyle'
              />
            </Button>
            : null}
        </div>
      </section>
      {tableLoader ? <Loader width={180} height={270} wrapperClass='generalLoader' tableRef={tableRef} /> : render()}
      <Modal
        activeModal={{ active: activeModal, setActive: setActiveModal }}
        title={modalTitle}
        onAccept={specialRequest ? handleSpecialRequest : handleSendFiles}
        noFooter={uploadLoader || loadingReport || !cdcNumber}
      >
        {!uploadLoader ? showCustomModalBody() :
        <Alert className='customFileAlert' type='warning' text={Texts.ACTIVE_LOAD} />}
      </Modal>
    </>
  )
}

export default Consults