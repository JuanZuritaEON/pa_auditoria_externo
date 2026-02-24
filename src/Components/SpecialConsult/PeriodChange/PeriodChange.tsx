import { useState } from 'react'
import { apiSlice, PeriodsChangeProps, SAVE_APP_FLUX, SAVE_ERRORS, useAppDispatch } from '../../../Redux'
import { assignPeriodDate, sendAppError, sendToastMessage } from '../../../Utils'
import { Alert, Button, GlobalMessage, Typography } from '../..'
import './PeriodChange.css'

const PeriodChange = (props: PeriodsChangeProps) => {
  const dispatch = useAppDispatch()
  const { requestChangePeriod } = apiSlice.endpoints
  const { actualPeriod, dates, numOtorgante, periods, startPeriod, userID } = props
  const formatActualPeriod = `${actualPeriod} Meses`
  const formatPeriods = Object.keys(periods).map((key: string) => (`${key.slice(8, key.length)} Meses`))
  const [newPeriod, setNewPeriod] = useState('')
  const endDateP = periods[`fechaFin${newPeriod.slice(0,1)}`]

  const handleChangePeriod = async () => {
    try {
      dispatch(SAVE_APP_FLUX({ generalLoader: true }))
      const { data, isSuccess, isError, error } = await dispatch(requestChangePeriod.initiate({
        numeroOtorgante: numOtorgante,
        nuevoPeriodo: parseInt(newPeriod.slice(0.1)),
        userId: userID
      }))
      if (isSuccess) {
        const messageComp = () => <GlobalMessage>
          <Typography typo={data.message} />
          {data.changeCorrect && <Typography typo='Se hará una recarga de página para actualizar el Periodo mostrado.'/>}
        </GlobalMessage>
        sendToastMessage({
          type: data.changeCorrect ? 'success' : 'warning',
          optionalComponent: messageComp(),
          closeTimer: 4000,
          position: 'bottom-right'
        })
        if (data.changeCorrect) {
          setTimeout(() => window.location.reload(), 4000)
        } else dispatch(SAVE_APP_FLUX({ generalLoader: false }))
      }
      if (isError) {
        dispatch(SAVE_APP_FLUX({ generalLoader: false }))
        dispatch(SAVE_ERRORS([error]))
      }
    } catch (error) {
      dispatch(SAVE_APP_FLUX({ generalLoader: false }))
      sendAppError(error)
    }
  }

  return (
    <section className='periodsContainer'>
      <Alert text={`Periodo Actual: ${formatActualPeriod} - "${assignPeriodDate({fechaInicio: dates.startDate, fechaFin: dates.endDate})}" `} type='info' noIcon/>
      {
        formatPeriods.map((period) => (
          <Button
            key={period[0]}
            disabled={period.includes(`${actualPeriod}`)}
            type='button'
            variant={`${newPeriod === period ? 'primary' : 'outline-primary'}`}
            onClick={() => setNewPeriod(period)}
            size='lg'
          >
            {period}
          </Button>
        ))
      }
      {
        newPeriod && (<>
          <Alert text={`Tu periodo quedará de la siguiente forma: ${newPeriod} - "${assignPeriodDate({fechaInicio: startPeriod, fechaFin: endDateP})}"`} type='warning' noIcon />
          <Button type='button' variant='primary' onClick={handleChangePeriod}>Solicitar Cambio</Button>
        </>)
      }
    </section>
  )
}

export default PeriodChange