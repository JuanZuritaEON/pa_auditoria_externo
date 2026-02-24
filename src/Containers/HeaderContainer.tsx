import { useMemo, useState } from 'react'
import { apiSlice, HeaderProps, Periods, SAVE_APP_FLUX, SAVE_ERRORS, Texts, useAppDispatch } from '../Redux'
import { assignPeriodDate, dateTransform, sendAppError } from '../Utils'
import { Button, Input, InputDate, Typography } from '../Components'

const HeaderContainer = (props: HeaderProps) => {
  const { actualDate, loadingData, dates: {startDate}, consultant: {periods, type, numOtorgante} } = props
  const dispatch = useAppDispatch()
  const { getControlFigs } = apiSlice.endpoints
  const isCommercial = (type === Texts.COMMERCIAL || type === Texts.REPAIRER)
  const actualMonth = actualDate.getMonth() + 1
  const limitedPastFiveYears = new Date()
  limitedPastFiveYears.setFullYear(limitedPastFiveYears.getFullYear() - 5)
	const [initialDate, setInitialDate] = useState(new Date(startDate.replace(/-/g, '/')))
	const [finalDate, setFinalDate] = useState(actualDate)
  const [period, setPeriod] = useState(startDate)
  const initialPeriod = useMemo(() => {return periods.filter((period) => period.startDate === startDate)[0]}, [periods, startDate])
  const handleInitial = (date: Date) => setInitialDate(date)
	const handleFinal = (date: Date) => {
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1 === actualMonth ? date.getMonth() : date.getMonth() + 1, (date.getMonth() + 1) === actualMonth ? new Date().getDate() : 0)
    setFinalDate(endDate)
  }
  const handleSearch = async (dates: Periods) => {
    try {
      dispatch(SAVE_APP_FLUX({ noContent: false, loadingData: true }))
      const controlFigsPromise = dispatch(getControlFigs.initiate({
        numeroOtorgante: numOtorgante,
        fechaInicio: dates.startDate,
        fechaFin: dates.endDate
      }))
      const { data, isSuccess, isError, error }  = await controlFigsPromise
      if (isSuccess) {
        dispatch(SAVE_APP_FLUX({
          selectedDates: dates,
          controlFigs: data,
          noContent: data.allConsults === 0,
          loadingData: false
        }))
      }
      if (isError) dispatch(SAVE_ERRORS([error]))
    } catch (error) {
      sendAppError(error)
    } finally { dispatch(SAVE_APP_FLUX({ loadingData: false })) }
  }

  return (
    <header className='containerHeader'>
      {isCommercial ? (
        <>
          <Typography typo='Rango de fecha de:' variant='normal' classNames='customTypo'/>
          <InputDate
            dateFormat="MMMM/yyyy"
            showMonthYearPicker
            maxDate={finalDate}
            minDate={limitedPastFiveYears}
            selected={initialDate}
            onChange={handleInitial}
            disabled={loadingData}
          />
          <Typography typo='A' variant='normal' classNames='customTypo'/>
          <InputDate
            dateFormat="MMMM/yyyy"
            showMonthYearPicker
            minDate={initialDate}
            selected={finalDate}
            onChange={handleFinal}
            disabled={loadingData}
          />
        </>
      ) : (
        <Input
          id="periodSelect"
          labelText='Periodos'
          disabled={loadingData}
          title='Selección Periodos'
          placeholder={assignPeriodDate({fechaInicio: initialPeriod.startDate, fechaFin: initialPeriod.endDate})}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => e.preventDefault()}
          onChange={(value: any) => setPeriod(value)}
          type='select'
          options={periods.map((period) => ({id: period.startDate, desc: assignPeriodDate({fechaInicio: period.startDate, fechaFin: period.endDate})}) )}
          value={period}
        />
      )}

      <Button
        type='button'
        variant='primary'
        classnames='customButton'
        disabled={loadingData}
        onClick={() => handleSearch({
          startDate: isCommercial ? dateTransform(initialDate) : period,
          endDate: isCommercial ? dateTransform(finalDate) : periods.filter((p) => p.startDate === period)[0].endDate
        })}
      >
        Buscar
      </Button>
    </header>
  )
}

export default HeaderContainer;