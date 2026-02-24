import { useCallback, useEffect, useState } from 'react'
import { useAppSelector, RootState, apiSlice, useAppDispatch, SAVE_ERRORS, Texts, SAVE_APP_FLUX, specialConsultDataColumns, S3Slice, SpecialSubTabs, SubTabsInfo, mediaType } from '../../Redux'
import { assignPeriodDate, dateTransform, downloadFile, getIconPerStatus, sendAppError, sendToastMessage, validateActualDate } from '../../Utils'
import { ArrowDownTrayIcon, Bars3Icon, DocumentPlusIcon, FolderArrowDownIcon } from '@heroicons/react/16/solid'
import { Alert, Button, Input, InputDate, Loader, Modal, NoTableRecords, SubTabs, Table, Typography } from '..'
import PeriodChange from './PeriodChange/PeriodChange'
import DetailedRow from '../DetailedRow/DetailedRow'
import './SpecialConsult.css'

const SpecialConsult = () => {
  const dispatch = useAppDispatch()
  const {
    app: {
      appFluxContext: {
        changePeriods,
        specialRequestStatus,
        specialRequestTopCall,
        consultant: {companyName,shortName,type, periods},
        liferayUser: { data:{nameUser,numOtorgante,userId} },
        specialConsultDates: {startDate, endDate}
      }
    },
    apiRequest: {queries}
  } = useAppSelector((state: RootState) => state)
  const { getSpecialConsultInfo, specialConsultNewRequest } = apiSlice.endpoints
  const { s3DownloadFile } = S3Slice.endpoints
  const [subTab, setSubTab] = useState<SpecialSubTabs>('newRequest')
  const actualMonth = new Date(endDate).getMonth() + 1
  const limitedPastFiveYears = new Date()
  limitedPastFiveYears.setFullYear(limitedPastFiveYears.getFullYear() - 5)
  const [initialDate, setInitialDate] = useState(new Date(startDate.replace(/-/g, '/')))
  const [finalDate, setFinalDate] = useState(new Date(endDate.replace(/-/g, '/')))
  const [authSelected, setAuthSelected] = useState('')
  const [activeModal, setActiveModal] = useState(false)
  const [loadingSpecial, setLoadingSpecial] = useState(false)
  const [loadingTable, setLoadingTable] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [fileReport, setFileReport] = useState({ name:'', data: '' })
  const [subTabs, setSubTabs] = useState<SubTabsInfo<SpecialSubTabs>>([
    {
      id: 'newRequest',
      name: 'Nueva Solicitud',
      icon: <DocumentPlusIcon
        title={'newRequest'}
        className='iconStandardStyle svgFill'
      />
    },
    {
      id: 'review',
      name: 'Consultar Estatus',
      icon: <Bars3Icon
        title={'Review'}
        className='iconStandardStyle svgFill'
      />
    }
  ])
  const [fileNotFound, setFileNotFound] = useState(false)

  const handleModal = () => {
    setModalTitle('Confirma los datos')
    setActiveModal(true)
  }
  const handleInitial = (date: Date) => setInitialDate(date)
  const handleFinal = (date: Date) => {
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1 === actualMonth ? date.getMonth() : date.getMonth() + 1, (date.getMonth() + 1) === actualMonth ? new Date().getDate() : 0)
    setFinalDate(endDate)
  }
  const reportStatus = (status: string) => status === 'Fallida' || status === 'Completada' ? 'Consulta el detalle para más información.' : 'Reporte en Proceso.'
  const handleReloadTable = useCallback(async () => {
    try {
      setLoadingTable(true)
      const { data, isSuccess, isError, error } = await dispatch(getSpecialConsultInfo.initiate({
        numeroOtorgante: numOtorgante
      }, { forceRefetch: true }))
      if (isSuccess) dispatch(SAVE_APP_FLUX({ specialRequestStatus: data }))
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      sendAppError(error)
    } finally { setLoadingTable(false) }
  }, [dispatch, getSpecialConsultInfo, numOtorgante])
  const handleNewSpecialRequest = async () => {
    try {
      setLoadingSpecial(true)
      const payload = {
        fechaInicio: dateTransform(initialDate),
        fechaFin: dateTransform(finalDate),
        numeroOtorgante: numOtorgante,
        estatus: authSelected === 'Todas' ? '' : authSelected,
        tipoOtorgante: type,
        userId: userId
      }
      const { isSuccess, isError, error } = await dispatch(specialConsultNewRequest.initiate(payload))
      if (isSuccess) {
        setInitialDate(new Date(startDate.replace(/-/g, '/')))
        setFinalDate(new Date(endDate.replace(/-/g, '/')))
        setAuthSelected('')
        setSubTab('review')
        setLoadingTable(true)
        setActiveModal(false)
        sendToastMessage({
          message: `La solicitud se realizó con éxito.`,
          type: 'success',
          closeTimer: 4500,
          position: 'bottom-right'
        })
        const { data, isSuccess, isError, error } = await dispatch(getSpecialConsultInfo.initiate({
          numeroOtorgante: numOtorgante
        }, { forceRefetch: true }))
        if (isSuccess) {
          dispatch(SAVE_APP_FLUX({ specialRequestStatus: data }))
          setLoadingTable(false)
        }
        if (isError) dispatch(SAVE_ERRORS([error]))
      }
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      sendAppError(error)
    }
  }
  const handleDownloadReport = async (id: number, fileName: string, eTag: string, key: string) => {
    try {
      setFileNotFound(false)
      setActiveModal(true)
      setLoadingSpecial(true)
      setFileReport({ name:'', data: '' })
      setModalTitle(`Reporte Solicitud Especial: ${id}`)
      const fileReportPromise = dispatch(s3DownloadFile.initiate({ 
        eTag,
        key
      }, { forceRefetch: true }))
      const { data, isSuccess, isError, error } = await fileReportPromise
      if (isSuccess) {
        if (data.isNotFound) {
          setFileNotFound(true)
          return dispatch(SAVE_ERRORS([{
            url: 'obtenerArchivo',
            code: '404',
            message: 'Archivo no encontrado.',
            active: true,
          }]))
        } else setFileReport({ name: fileName, data: data.data })
      }
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      dispatch(SAVE_ERRORS([error]))
    } finally { setLoadingSpecial(false) }
  }

  const showTable = () => {
    if (loadingTable) return <Loader wrapperClass='generalLoader' />
    if (specialRequestStatus.length === 1 && specialRequestStatus[0].id === 0) return <NoTableRecords message={Texts.NO_SPECIAL_REPORTS} reload={handleReloadTable} />
    return (
      <>
        <Alert text='Consultar Estatus' type='info' noIcon className='titleSpecial addMargin' />
        <Table
          alertText='Para ver el detalle de la Solicitud, da click en la fila que desee consultar.'
          columns={specialConsultDataColumns}
          data={specialRequestStatus.map(special => ({
            ...special,
            period: <div title={assignPeriodDate({fechaInicio: special.period.start, fechaFin: special.period.end})}>
              {assignPeriodDate({fechaInicio: special.period.start, fechaFin: special.period.end})}
            </div>,
            status: <div
              className='specialCustomButton'
              title={special.status}>
                <img src={getIconPerStatus(special.status)} alt={special.status} />
            </div>,
            viewFile: special.viewFile ? <Button
              onClick={() => handleDownloadReport(special.id, special.fileName, special.eTag, special.fileRef)}
              className={'downloadReportButton'}
              title='Reporte'>
                <ArrowDownTrayIcon
                  title={'Reporte'}
                  className='iconStandardStyle svgFill'
                />
            </Button> : <div title={reportStatus(special.status)}>{reportStatus(special.status)}</div>
          }))}
          expandableComponent={DetailedRow}
          reloadTable={handleReloadTable}
          subHeader
          totalRows={specialRequestStatus.length}
        />
      </>
    )
  }
  const showInfoModal = () => {
    if (!loadingSpecial && fileReport.name && fileReport.data && subTab === 'review') return (
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
    else if (!loadingSpecial && !fileReport.data && subTab === 'review') return <Alert text={fileNotFound ? 'El archivo solicitado no fue encontrado.' : Texts.ERROR_FILE_DOWNLOAD} type='danger' className='alertFileError' />
    return (
      <article className='modalData'>
        <div>
          <Typography typo={'Solicitante:'} variant='bold'/>
          <Typography typo={<>- Lorem</>} />
          <Typography typo={<>- {shortName} {numOtorgante} - {companyName}</>} />
        </div>
        <div className='verticalSeparator'/>
        <div>
          <Typography typo={'Filtros:'} variant='bold'/>
          <Typography typo={<>- Autorización - {authSelected ? mediaType.filter((m:any) =>m.claveMedio === authSelected)[0].descMedio : ''}</>} />
          <Typography typo={<>- Periodo - {assignPeriodDate({
            fechaInicio: dateTransform(initialDate), 
            fechaFin: dateTransform(validateActualDate(finalDate).date)
          },true)}</>} />
          {validateActualDate(finalDate).isExactToday ? 
            <Alert text={Texts.SPECIAL_ALERT_TODAY} type='info' className='alertStyleModal' /> :
            null
          }
        </div>
      </article>
    )
  }
  const showTab = () => {
    switch (subTab) {
      case 'review': return showTable()
      case 'periods': return <PeriodChange
        actualPeriod={changePeriods.actualPeriod}
        dates={periods[0]}
        periods={changePeriods.periodEnds}
        startPeriod={changePeriods.startPeriodDate}
        numOtorgante={numOtorgante}
        userID={userId}
      />
      default: return (
        <section className='specialContainer'>
          <Alert text='Nueva Solicitud' type='info' noIcon className='titleSpecial'/>
          <Typography typo={<u>- {nameUser}</u>} variant='italic' />
          <Typography typo={<u>- {shortName} {numOtorgante} - {companyName}</u>} variant='italic' />
          <div className='horizontalSeparator'/>
          <article className='valuesContent'>
            <div className='datesSelector'>
              <Typography typo='Seleccione el periodo que desea consultar:' />
              <div>
                <div>
                  <Typography typo='Fecha Inicial:' variant='normal'/>
                  <InputDate
                    dateFormat="MMMM/yyyy"
                    showMonthYearPicker
                    maxDate={finalDate}
                    minDate={limitedPastFiveYears}
                    selected={initialDate}
                    onChange={handleInitial}
                  />
                </div>
                <div>
                  <Typography typo='Fecha Final:' variant='normal'/>
                  <InputDate
                    dateFormat="MMMM/yyyy"
                    showMonthYearPicker
                    minDate={initialDate}
                    selected={finalDate}
                    onChange={handleFinal}
                  />
                </div>
              </div>
            </div>
            <div className='verticalSeparator'/>
            <div className='statusSelector'>
              <Typography typo='Autorizaciones:'/>
              <Input
                id="auditTypeSelect"
                labelText='Estatus de Autorización'
                title='Estatus de Autorización'
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => e.preventDefault()}
                onChange={(value: any) => {
                  setAuthSelected(value)
                }}
                type='select'
                options={mediaType.map(media => ({id: media.claveMedio, desc: media.descMedio}))}
                value={authSelected}
              />
            </div>
          </article>
          <Typography typo={<>
            <Alert text='Al realizar una Solicitud Especial, no podrás cancelarla' type='info' />
            <Button type='button' variant='primary' onClick={handleModal} disabled={!authSelected}>Generar Solicitud</Button>
          </>}  classNames='confirmSection' />
        </section>
      )
    }
  }

  useEffect(() => {
    if (changePeriods.availability) return setSubTabs(prev => {
      if (prev.filter(tab => tab.id === 'periods').length > 0) return prev
      return [...prev, {
        id: 'periods',
        name: 'Selecciona tu periodo de auditoria',
        icon: <Bars3Icon
          title={'periods'}
          className='iconStandardStyle svgFill'
        />
      }]
    })
  }, [changePeriods.availability])

  useEffect(() => {
    const redoRequests = async () => {
      try {
        if (!specialRequestTopCall) return
        setSubTab('review')
        setLoadingTable(true)
        const { data, isSuccess, isError, error } = await dispatch(getSpecialConsultInfo.initiate({
          numeroOtorgante: numOtorgante
        }, { forceRefetch: true }))
        if (isSuccess) {
          dispatch(SAVE_APP_FLUX({ specialRequestStatus: data, specialRequestTopCall: false }))
          setLoadingTable(false)
        }
        if (isError) dispatch(SAVE_ERRORS([error]))
      } catch (error) {
        sendAppError(error)
        setLoadingTable(false)
        dispatch(SAVE_APP_FLUX({ specialRequestTopCall: false }))
      }
    }
    redoRequests()
  }, [dispatch, getSpecialConsultInfo, numOtorgante, specialRequestTopCall])

  useEffect(() => {
    if (queries.hasOwnProperty(`getSpecialConsultInfo({"numeroOtorgante":"${numOtorgante}"})`)) return
    subTab === 'review' && handleReloadTable()
  }, [subTab, queries, numOtorgante, handleReloadTable])

  return (
    <>
      <SubTabs<SpecialSubTabs> subTabActual={subTab} setTab={setSubTab} tabs={subTabs} />
      {showTab()}
      <Modal
        activeModal={{ active: activeModal, setActive: setActiveModal }}
        title={modalTitle}
        onAccept={handleNewSpecialRequest}
        noFooter={subTab === 'review' || loadingSpecial}
      >
        {
          loadingSpecial ? <Loader wrapperClass='generalLoader' width={60} height={60} /> : (
            showInfoModal()
          )
        }
      </Modal>
    </>
  )
}

export default SpecialConsult