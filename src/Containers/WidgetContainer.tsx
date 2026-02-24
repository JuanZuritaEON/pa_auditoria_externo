import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  apiSlice,
  S3Slice,
  RootState,
  useAppDispatch,
  useAppSelector,
  SAVE_APP_FLUX,
  SAVE_ERRORS,
  Texts,
  ContainerProps,
  Periods
} from '../Redux'
import { assignPeriodDate, dateTransform, formatDate, sendToastMessage } from '../Utils'
import { GlobalMessage, Loader, NoDataBox, ProgressIcon } from '../Components'
import { BodyContainer, HeaderContainer } from '.'
import { useBeforeunload } from '../Hooks'
import { isEmpty } from 'lodash'

const WidgetContainer = ({
  toastFunc,
  nameUser,
  numOtorgante
}: ContainerProps) => {
  const dispatch = useAppDispatch()
  const {
    abortSignalS3,
    actualTab,
    generalLoader,
    loadingData,
    saveMultipartData,
    selectedDates,
    progress,
    toastID,
    uploadLoader
  } = useAppSelector((state: RootState) => state.app.appFluxContext)
  const actualDate = useMemo(() => {return new Date()}, [])
  const initialMonthDate = useMemo(() => {return new Date(actualDate.getFullYear(), actualDate.getMonth(), 1)}, [actualDate])
  const [initialDates, setInitialDates] = useState(selectedDates)
  const [emptyConsultant, setEmptyConsultant] = useState(false)
  const consultantNumber = numOtorgante ?? Texts.DEFAULT_CONSULT_NUMBER
  const nameLoggedUser = nameUser ?? Texts.NAME_USER
  const {
    useGetLoggedUserInfoQuery,
    useGetAllMediaQuery,
    useGetControlFigsQuery,
    useGetChangePeriodInfoQuery,
/*     useGetMassiveFileInfoQuery,
    useGetFluxesInfoQuery,
    useGetSpecialConsultInfoQuery, */
  } = apiSlice
  const { abortMultipartS3 } = S3Slice.endpoints

  const handleReviewDates = useCallback((type: string, periods: Periods) => {
    if (!type) {
      sendToastMessage({
        type: 'warning',
        closeOnClick: true,
        closeTimer: 5000,
        message: 'El otorgante no se encuentra configurado.',
        position: 'bottom-right'
      })
      setEmptyConsultant(true)
      dispatch(SAVE_APP_FLUX({ generalLoader: false }))
      return
    }
    const isCommercial = (type === Texts.COMMERCIAL || type === Texts.REPAIRER)
    const initialDate = isCommercial ? formatDate(initialMonthDate) : periods.startDate
    const endDate = isCommercial ? formatDate(actualDate) : periods.endDate
    setInitialDates({
      startDate: initialDate,
      endDate: endDate
    })
    dispatch(SAVE_APP_FLUX({ specialConsultDates: {
      startDate: formatDate(initialMonthDate),
      endDate: formatDate(actualDate)
    },
    selectedDates: {
      startDate: initialDate,
      endDate: endDate
    }}))
  }, [actualDate, initialMonthDate, dispatch])

  const {
    data: loggedUserData,
    isLoading: loadingLoggedUser,
    isSuccess: successLoggedUser,
    isError: hasErrorLoggedUser,
    error: errorLoggedUser
  } = useGetLoggedUserInfoQuery({ numeroOtorgante: consultantNumber })
  const {
    data: allMediaData,
    isLoading: loadingAllMedia,
    isSuccess: successAllMedia,
    isError: hasErrorAllMedia,
    error: errorAllMedia
  } = useGetAllMediaQuery({}, { skip: loadingLoggedUser || hasErrorLoggedUser })
  const {
    data: controlFigsData,
    isLoading: loadingControlFigs,
    isSuccess: successControlFigs,
    isError: hasErrorControlFigs,
    error: errorControlFigs
  } = useGetControlFigsQuery({
    numeroOtorgante: consultantNumber,
    fechaInicio: initialDates.startDate,
    fechaFin: initialDates.endDate
  }, { skip: loadingLoggedUser || hasErrorLoggedUser || isEmpty(initialDates.startDate) })
  const {
    data: changePeriodsData,
    isLoading: loadingChangePeriods,
    isSuccess: successChangePeriods,
    isError: hasErrorChangePeriods,
    error: errorChangePeriods
  } = useGetChangePeriodInfoQuery({
    numeroOtorgante: consultantNumber
  }, { skip: loadingLoggedUser || hasErrorLoggedUser || loggedUserData.type !== Texts.FINANCIAL})
/*   const {
    data: massiveFilsStatusData,
    isLoading: loadingMassiveFilsStatus,
    isSuccess: successMassiveFilsStatus,
    isError: hasErrorMassiveFilsStatus,
    error: errorMassiveFilsStatus
  } = useGetMassiveFileInfoQuery({
    numeroOtorgante: consultantNumber
  }, { skip: loadingLoggedUser || hasErrorLoggedUser }) */
/*   const {
    data: fluxesStatusData,
    isLoading: loadingFluxesStatus,
    isSuccess: successFluxesStatus,
    isError: hasErrorFluxesStatus,
    error: errorFluxesStatus
  } = useGetFluxesInfoQuery({
    numeroOtorgante: consultantNumber
  }, { skip: loadingLoggedUser || hasErrorLoggedUser})
  const {
    data: specialConsultStatusData,
    isLoading: loadingSpecialConsultStatus,
    isSuccess: successSpecialConsultStatus,
    isError: hasErrorSpecialConsultStatus,
    error: errorSpecialConsultStatus
  } = useGetSpecialConsultInfoQuery({
    numeroOtorgante: consultantNumber
  }, { skip: loadingLoggedUser || hasErrorLoggedUser }) */

  useEffect(() => {
    if (loadingLoggedUser) dispatch(SAVE_APP_FLUX({ generalLoader: true }))
    if (successLoggedUser) {
      dispatch(SAVE_APP_FLUX({ consultant: loggedUserData, noInfoRequest: loggedUserData.status === '' }))
      handleReviewDates(loggedUserData.type, loggedUserData.periods[0])
    }
    if (hasErrorLoggedUser) { dispatch(SAVE_APP_FLUX({ generalLoader: false })); dispatch(SAVE_ERRORS([errorLoggedUser]))}
  }, [loggedUserData, loadingLoggedUser, successLoggedUser, hasErrorLoggedUser, errorLoggedUser, handleReviewDates, dispatch])
  useEffect(() => {
    if (!loadingAllMedia) {
      if (successAllMedia) dispatch(SAVE_APP_FLUX({ mediaAll: allMediaData, noInfoRequest: allMediaData[0].claveMedio === 0 }))
      if (hasErrorAllMedia) dispatch(SAVE_ERRORS([errorAllMedia]))
    }
  }, [allMediaData, loadingAllMedia, successAllMedia, hasErrorAllMedia, errorAllMedia, dispatch])
  useEffect(() => {
    if (!loadingControlFigs) {
      if (successControlFigs) dispatch(SAVE_APP_FLUX({ generalLoader: false, controlFigs: controlFigsData, noInfoRequest: controlFigsData.allConsults === 0 }))
      if (hasErrorControlFigs) { dispatch(SAVE_APP_FLUX({ generalLoader: false })); dispatch(SAVE_ERRORS([errorControlFigs])) }
    }
  }, [controlFigsData, loadingControlFigs, successControlFigs, hasErrorControlFigs, errorControlFigs, dispatch])
  useEffect(() => {
    if (!loadingChangePeriods) {
      if (successChangePeriods) {
        dispatch(SAVE_APP_FLUX({ changePeriods: changePeriodsData, noInfoRequest: isEmpty(changePeriodsData.startPeriodDate) }))
        if (changePeriodsData.expirationPeriod) {
          const daysLeft = parseInt(changePeriodsData.expirationPeriod)
          const textPlural = daysLeft > 1 ? 'días' : 'día'
          actualDate.setDate((actualDate.getDate() + 1) + daysLeft)
          const componentMessage = () => <GlobalMessage>
              <span className='customPeriodMessage'>
                --- Periodo finaliza en {changePeriodsData.expirationPeriod} {textPlural}. ---
              </span>
              <span>Tu próxima auditoria es el "{assignPeriodDate({ fechaInicio: dateTransform(actualDate) }, true)}"</span>
          </GlobalMessage>
          sendToastMessage({
            type: 'info',
            position: 'top-right',
            optionalComponent: componentMessage()
          })
        }
      }
      if (hasErrorChangePeriods) dispatch(SAVE_ERRORS([errorChangePeriods]))
    }
  }, [actualDate, changePeriodsData, loadingChangePeriods, successChangePeriods, hasErrorChangePeriods, errorChangePeriods, dispatch])
/*   useEffect(() => {
    if (!loadingMassiveFilsStatus) {
      if (successMassiveFilsStatus) dispatch(SAVE_APP_FLUX({ statusMassive: massiveFilsStatusData, noInfoRequest: massiveFilsStatusData.length === 0 }))
      if (hasErrorMassiveFilsStatus) dispatch(SAVE_ERRORS([errorMassiveFilsStatus]))
    }
  }, [massiveFilsStatusData, loadingMassiveFilsStatus, successMassiveFilsStatus, hasErrorMassiveFilsStatus, errorMassiveFilsStatus, dispatch])
  useEffect(() => {
    if (!loadingFluxesStatus) {
      if (successFluxesStatus) dispatch(SAVE_APP_FLUX({ fluxes: fluxesStatusData, noInfoRequest: fluxesStatusData.length === 0 }))
      if (hasErrorFluxesStatus) dispatch(SAVE_ERRORS([errorFluxesStatus]))
    }
  }, [fluxesStatusData, loadingFluxesStatus, successFluxesStatus, hasErrorFluxesStatus, errorFluxesStatus, dispatch])
  useEffect(() => {
    if (!loadingSpecialConsultStatus) {
      if (successSpecialConsultStatus) dispatch(SAVE_APP_FLUX({ specialRequestStatus: specialConsultStatusData, noInfoRequest: specialConsultStatusData.length === 0 }))
      if (hasErrorSpecialConsultStatus) dispatch(SAVE_ERRORS([errorSpecialConsultStatus]))
    }
  }, [specialConsultStatusData, loadingSpecialConsultStatus, successSpecialConsultStatus, hasErrorSpecialConsultStatus, errorSpecialConsultStatus, dispatch])
 */
  useEffect(() => {
    if (uploadLoader && toastID) toastFunc.update(toastID, { 
      progress: progress,
      icon: <ProgressIcon progress={progress} />
    })
    if (progress === 1 && !uploadLoader) dispatch(SAVE_APP_FLUX({ progress: 0, toastID: null}))
    abortSignalS3 && setTimeout(() => {
      toastFunc.dismiss()
      dispatch(SAVE_APP_FLUX({ abortSignalS3: false }))
    }, 5000)
  }, [progress, uploadLoader, toastID, abortSignalS3, toastFunc, dispatch])

  useBeforeunload(e => {e.preventDefault()}, uploadLoader, abortMultipartS3, saveMultipartData )

  if (generalLoader) return <Loader width={180} height={180} wrapperClass='generalLoader' />
  if ((!loadingLoggedUser && hasErrorLoggedUser) || emptyConsultant) return <NoDataBox text={emptyConsultant ? Texts.NO_CONSULTANT_CONFIG : Texts.NO_CONSULTANT_INFO} />
  return (
    <main className='containerMainFluid'>
      {!loadingLoggedUser && (
        <>
          <HeaderContainer
            actualDate={actualDate}
            consultant={{
              periods: loggedUserData.periods,
              type: loggedUserData.type,
              numOtorgante: consultantNumber,
              email: loggedUserData.email,
              phone: loggedUserData.phone
            }}
            dates={initialDates}
            loadingData={loadingData}
          />
          <BodyContainer
            actualTab={actualTab}
            consultant={{
              periods: loggedUserData.periods,
              type: loggedUserData.type,
              nameUser: nameLoggedUser,
              numOtorgante: consultantNumber,
              email: loggedUserData.email,
              phone: loggedUserData.phone
            }}
            companyName={`${loggedUserData.companyName} (${consultantNumber})`}
            dates={selectedDates}
            loadingData={loadingData}
          />
        </>
      )}
    </main>
  )
}

export default WidgetContainer