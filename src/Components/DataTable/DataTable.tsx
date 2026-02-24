import { useState } from 'react'
import { paginationComponentOptions, DataTableCustomStyles, DataTableProps } from '../../Redux';
import SubHeaderComponent from './SubHeaderComponent/SubHeaderComponent';
import DataTable from 'react-data-table-component'
import {Texts} from '../../Redux/constants'
import { Alert } from '..';
import './DataTable.css'

const NoInfo = <Alert className='noInfoComp' noIcon text={Texts.NO_INFO_SEARCH} type='warning' />

const Table = ({
  alertText,
  columns,
  data,
  downloadReport,
  expandableComponent,
  fixedHeight = '70dvh',
  reloadTable,
  subHeader = false,
  tableRef,
  title = '',
  totalRows,
}: DataTableProps) => {
  const [expand, setExpand] = useState(false)
  const [cleanData, setCleanData] = useState(data)

 return (
  <div ref={tableRef}>
    <DataTable
      columns={columns}
      className={`${expand ? 'expandRow' : 'normalRow'}`}
      customStyles={DataTableCustomStyles}
      data={cleanData}
      expandableRows={!!expandableComponent}
      expandableRowsComponent={expandableComponent}
      expandOnRowClicked
      fixedHeader
      fixedHeaderScrollHeight={fixedHeight}
      highlightOnHover
      keyField={Object.values(columns[0])[0] as string}
      noDataComponent={NoInfo}
      pagination
      paginationPerPage={30}
      paginationComponentOptions={paginationComponentOptions}
      paginationTotalRows={totalRows}
      responsive
      subHeader={subHeader}
      subHeaderComponent={<SubHeaderComponent
        alertText={alertText}
        cleanData={data}
        downloadReport={downloadReport}
        setFilterData={setCleanData}
        handleReload={reloadTable}
        placeholderNames={columns.map(column => (Object.values(column)[1])).slice(0,2) as string[]}
        filterValues={columns.map(column => (Object.values(column)[0])).slice(0,2) as string[]}
        expanded={expand}
        setExpanded={setExpand}
      />}
      title={title}
    />
  </div>
 )
}

export default Table