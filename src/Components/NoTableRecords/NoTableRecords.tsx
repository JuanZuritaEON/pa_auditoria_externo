import React from 'react'
import { ArrowPathIcon } from '@heroicons/react/16/solid'
import { NoDataTableRecordsProps } from '../../Redux'
import { Alert, Button, Typography } from '..'
import './NoTableRecords.css'

const NoTableRecords = (props: NoDataTableRecordsProps) => {
  const { reload, message, className } = props
  return (
    <div className={`noDataMessage ${className}`}>
      <Alert type='info' text={message} />
      <Button title='Actualizar' type="button" variant='outline-primary' size='sm' onClick={reload}>
        <Typography typo={'Actualizar'}/>
        <ArrowPathIcon
        title={'Actualizar'}
        className='iconStandardStyle svgFill'
        />
      </Button>
    </div>
  )
}

export default NoTableRecords