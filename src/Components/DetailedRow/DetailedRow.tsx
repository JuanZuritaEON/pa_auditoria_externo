import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector, RootState, apiSlice, SAVE_ERRORS } from '../../Redux'
import { LineGraph, Loader, Typography } from '..'
import { assignPeriodDate, reviewDetailsData } from '../../Utils'
import './DetailedRow.css'

const DetailedRow = ({ data }: any) => {
  const dispatch = useAppDispatch()
  const { liferayUser: {data: {nameUser}} } = useAppSelector((state: RootState) => state.app.appFluxContext)
  const { consultNumber, companyName, id, upDate } = data
  const { useGetSpecialDetailQuery } = apiSlice
  const [dataGraph, setDataGraph] = useState([{
    name: '',
    uv: 0,
    text: '',
    date: ''
  }])
  const consultName = `${consultNumber} - ${companyName}`

  const {
    data: detailedData,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetSpecialDetailQuery({ idSolicitud: id })

  useEffect(() => {
    if (!isLoading) {
      if (isSuccess) {
        const arrayOfData = reviewDetailsData(
          upDate,
          detailedData.requestStatus,
          detailedData.beginProcess,
          detailedData.dateComplete,
          detailedData.dateExpired,
          detailedData.dateFailed,
          detailedData.detailViewFile
        )
        setDataGraph(arrayOfData.map(data => ({...data, uv: 10})))
      }
      if (isError) dispatch(SAVE_ERRORS([error]))
    }
  }, [detailedData, isLoading, isSuccess, isError, error, upDate, dispatch])

  if (isLoading) return <Loader wrapperClass='generalLoader' width={60} height={60} />
  return (
    <>
      {
        !isLoading && (
          <section className='detailContainer'>
            <div className='informationRequest'>
              <Typography typo={`- Solicitud: ${detailedData.idRequest}`} size='sm' />
              <Typography typo={`- Usuario: ${nameUser}`} size='sm' />
              <Typography typo={`- Otorgante: ${consultName}`} size='sm' />
              <Typography typo={`- Fecha Alta: ${assignPeriodDate({ fechaInicio: upDate }, true)}`} size='sm' />
              <Typography typo={`- Estatus: ${detailedData.requestStatus}`} size='sm' />
              {detailedData.requestStatus === 'Completada' && 
                <>
                  <Typography typo={`- Fecha Completada: ${assignPeriodDate({fechaInicio:detailedData.dateComplete.slice(0, 10)}, true)}`} size='sm' />
                  {!detailedData.detailViewFile && <Typography typo={'- Reporte: La Solicitud tiene más de 2 meses de antigüedad por lo que el archivo ya no se encuentra disponible, deberá generar una nueva Solicitud.'} size='sm' />}
                </>
              }
              {detailedData.requestStatus === 'Fallida' && 
                <>
                  <Typography typo={`- Fecha Fallida: ${assignPeriodDate({fechaInicio:detailedData.dateFailed.slice(0, 10)}, true)}`} size='sm' />
                  <Typography typo={`- Observaciones: ${detailedData.moreDetails}`} size='sm' />
                </>
              }
            </div>
            <div className='contentGraph'>
              <LineGraph data={dataGraph} />
            </div>
          </section>
        )
      }
    </>
  )
}

export default DetailedRow