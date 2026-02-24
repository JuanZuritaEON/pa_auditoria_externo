import { KeyboardEvent, useState } from 'react'
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/16/solid'
import { isEmpty, isNull, isUndefined } from 'lodash'
import { SubHeaderTableProps } from '../../../Redux'
import { Alert, Button, Input } from '../..'
import './SubHeaderComponent.css'

const SubHeaderComponent = (props: SubHeaderTableProps) => {
  const {
    alertText = '',
    cleanData,
    downloadReport = null,
    expanded,
    filterValues,
    handleReload = null,
    placeholderNames,
    setExpanded,
    setFilterData,
  } = props

  const [filterText, setFilterText] = useState('')
  
  const filteredItems = () => {
    if (isEmpty(filterText)) return setFilterData(cleanData)
    const [filtered] = filterValues.map((value) => {
      const filtered = cleanData.filter((data) => {
        const objectData = data[value]
        const isString = typeof objectData === 'string'
        const isInt = typeof objectData === 'number'
        if (isInt) return objectData.toString().toLowerCase().includes(filterText.toLowerCase())
        if (isString) return objectData.toLowerCase().includes(filterText.toLowerCase())
        return null
      })
      return filtered
    }).filter((subArray: any) => subArray.length > 0)
    setFilterData(isUndefined(filtered) ? [] : filtered)
  }
  const clearFilter = () => {
    setFilterText('');
    setFilterData(cleanData);
  }
  const handleKeyDown = ({ key }: KeyboardEvent) => key === "Enter" && filteredItems()

  return (
    <section className='subHeaderContainer_Table'>
      {alertText && <Alert text={alertText} type='info' className='customPositionAlert' />}
      <Input
        id="search"
        labelText={'Buscar'}
        placeholder={placeholderNames.map((value: string) => value).join(', ')}
        onChange={(newValue: any) => setFilterText(newValue)}
        onKeyDown={handleKeyDown}
        value={filterText}
      >
        <MagnifyingGlassIcon
          onClick={filteredItems}
          title={'Buscar'}
          className='iconStandardStyle svgFill'
        />
        <XMarkIcon
          onClick={clearFilter}
          title={'Limpiar'}
          className='iconStandardStyle svgFill'
        />
      </Input>
      <Button title='Expandir Info' type="button" className='reportButton' onClick={() => setExpanded(!expanded)}>
        {
          expanded ?
            <ArrowsPointingInIcon
            title={'Reducir'}
            className='iconStandardStyle'
            />
          :
            <ArrowsPointingOutIcon
            title={'Expandir'}
            className='iconStandardStyle'
            />
        }
      </Button>
      {!isNull(handleReload) && 
        <Button title='Actualizar' type="button" className='reportButton' onClick={handleReload}>
          <ArrowPathIcon
          title={'Actualizar'}
          className='iconStandardStyle'
          />
        </Button>
      }
      {!isNull(downloadReport) && 
        <Button title='Descargar reporte' type="button" className='reportButton' onClick={downloadReport}>
          <ArrowDownTrayIcon
          title={'Descargar reporte'}
          className='iconStandardStyle'
          />
        </Button>
      }
    </section>
)
}

export default SubHeaderComponent