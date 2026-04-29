import {
  calendar,
  signature,
  upload,
  workflow,
  click_orange,
  click_blue,
  click_green,
  click_yellow
} from "../assets/images"
import { ListConsults, ListFluxes, ListMassive, ListSpecials } from "./interface"
import { getElement } from "../Utils"

export enum Texts {
  ACTIVE_LOAD = 'Carga de archivo en progreso, por favor espera a que termine antes de realizar una nueva carga.',
  ALERT_FLUX = 'Recuerda subir tu Formato de Autorización por el siguiente medio: "Nueva Carga+ > Firma Autógrafa > Adjuntar Archivo > Enviar."',
  BUTTON_SEARCH = 'Buscar',
  COMMERCIAL = 'COMERCIAL',
  DEFAULT_CONSULT_NUMBER = '000268',
  ERROR_CODE = 'Código de error',
  ERROR_FILE_DOWNLOAD = 'Hubo un error al descargar tu archivo, por favor inténtalo de nuevo.',
  FINANCIAL = 'FINANCIERO',
  FIRST_TAB = 'Consultas del Periodo',
  FINANCIAL_FIRST_TAB = 'Muestra del Periodo',
  FINISHING_LOAD = 'Estamos finalizando la carga, por favor espere.',
  FLUX_AUTH = 'Cómo parte del proceso de validación de flujos, es necesario que realices la carga del formato de autorización con firma autógrafa utilizado por su empresa, esto con la finalidad de corroborar que cumpla con los requisitos necesarios.',
  FLUXES_UPLOAD = 'Carga de Flujos',
  MASSIVE_UPLOAD = 'Carga Masiva',
  NAME_USER = 'Lorem Ipsum Data',
  NO_CONSULTANT_INFO = 'Hubo un error al obtener la información del otorgante, por favor vuelva a cargar la página.',
  NO_CONSULTANT_CONFIG = 'Hubo un error, el otorgante no se encuentra configurado.',
  NO_INFO = 'Sin información en esta sección.',
  NO_INFO_FLUXES = 'Aún no tienes flujos por mostrar, realiza una carga dando clic en el botón: Nueva Carga+',
  NO_MASSIVE_REPORTS = 'No hay registro de archivos por el momento, recuerda que el tiempo estimado de procesamiento es de 24 h.',
  NO_SPECIAL_REPORTS = 'No hay registro de solicitudes especiales por el momento.',
  NO_INFO_SEARCH = 'Sin información para la búsqueda.',
  NO_INFO_FINANCIAL = 'Esta información se mostrará una vez que inicies tu proceso de auditoria.',
  REPAIRER = 'REPARADORA',
  SPECIAL_REQUESTS = 'Solicitudes Especiales',
  SPECIAL_ALERT_TODAY = 'Al seleccionar el mes actual se cambiará la fecha al dia anterior, esto para disponer de datos correctos.'
}
export const Titles = ['Pendientes De Auditar', 'Entregadas', 'Rechazadas', 'Auditadas', 'Total de Muestra']
export const GraphColors = ['#FF3333', '#407FC1', '#EE9E69', '#A0CA72']
export const ButtonFigsIcons = [click_orange, click_blue, click_yellow, click_green]
export const CustomButtonFigsClasses = ['stylePending', 'styleDelivered', 'styleRejected', 'styleAudit']
export const standardFileExtensions = ['.jpg', '.pdf', '.tiff', '.tif', '.png', '.jpeg']
export const fluxExtensions = ['.docx', '.pdf', '.pptx', '.jpg', '.png', '.mp4', '.jpeg']
export const nipCiecExtensions = ['.xlsx', '.xls', '.csv', '.txt']
export const audioExtensions = ['.mp3', '.wav', '.mp4']
export const zipExtension = ['.zip']

export const paginationComponentOptions = {
  rowsPerPageText: 'Filas por página:', 
  rangeSeparatorText: 'de',
  selectAllRowsItem: false, 
  selectAllRowsItemText: 'ALL'
}

export const DataTableCustomStyles = {
  responsiveWrapper: {
		style: {
			borderRadius: '10px 10px 0px 0px',
		},
	},
  header: {
		style: {
			color: '#4463B3',
      fontSize: '2.5rem',
      margin: '1rem auto -0.75rem',
      textAlign: 'center'
		},
	},
  head: {
		style: {
			fontSize: '1rem',
      color: 'white',
      fontWeight: 'bold'
		},
	},
  subHeader: {
		style: {
      width: '100%',
      display: 'flex',
      padding: '0',
		},
	},
  headRow: {
		style: {
      backgroundColor: '#4463B3',
      borderRadius: '10px 10px 0px 0px',
		},
	},
  rows: {
    style: {
      color: '#0b1a28'
    },
  },
}

export const consultsDataColumns = [
  {
    id: 'cdcFolio',
    name: 'Folio CDC',
    selector: (row: ListConsults) => row.cdcFolio,
    cell: (row: ListConsults) => getElement(row.cdcFolio),
    sortable: true
  },
  {
    id: 'consultantFolio',
    name: 'Folio Otorgante',
    selector: (row: ListConsults) => row.consultantFolio,
    cell: (row: ListConsults) => getElement(row.consultantFolio),
    sortable: true
  },
  {
    id: 'signNumber',
    name: 'Número de Firma',
    selector: (row: ListConsults) => row.signNumber,
    cell: (row: ListConsults) => getElement(row.signNumber),
    sortable: true,
  },
  {
    id: 'consultDate',
    name: 'Fecha Consulta',
    selector: (row: ListConsults) => row.consultDate,
    cell: (row: ListConsults) => getElement(row.consultDate),
    sortable: true
  },
  {
    id: 'status',
    name: 'Estatus',
    selector: (row: ListConsults) => row.status,
    cell: (row: ListConsults) => row.status,
    sortable: true
  },
  {
    id: 'nameClient',
    name: 'Nombre',
    selector: (row: ListConsults) => row.nameClient,
    cell: (row: ListConsults) => getElement(row.nameClient),
    sortable: true
  },
  {
    id: 'productKey',
    name: 'Clave Producto',
    selector: (row: ListConsults) => row.productKey,
    cell: (row: ListConsults) => getElement(row.productKey),
    sortable: true
  },
  {
    id: 'product',
    name: 'Producto',
    selector: (row: ListConsults) => row.product,
    cell: (row: ListConsults) => getElement(row.product),
    sortable: true
  },
  {
    id: 'hasFile',
    name: 'Trámite',
    selector: (row: ListConsults) => row.hasFile,
    cell: (row: ListConsults) => row.hasFile,
    sortable: true,
  },
  {
    id: 'remarks',
    name: 'Observaciones',
    selector: (row: ListConsults) => row.remarks,
    cell: (row: ListConsults) => getElement(row.remarks),
    sortable: true,
  }
]

export const massiveDataColumns = [
  {
    id: 'idStatus',
    name: 'ID',
    selector: (row: ListMassive) => row.idStatus,
    cell: (row: ListMassive) => getElement(row.idStatus.toString()),
    sortable: true
  },
  {
    id: 'consultNumber',
    name: 'Número Otorgante',
    selector: (row: ListMassive) => row.consultNumber,
    cell: (row: ListMassive) => getElement(row.consultNumber),
    sortable: true
  },
  {
    id: 'fileName',
    name: 'Nombre',
    selector: (row: ListMassive) => row.fileName,
    cell: (row: ListMassive) => getElement(row.fileName),
    sortable: true
  },
  {
    id: 'auditType',
    name: 'Medio de entrega',
    selector: (row: ListMassive) => row.auditType,
    cell: (row: ListMassive) => getElement(row.auditType),
    sortable: true
  },
  {
    id: 'upDate',
    name: 'Fecha Alta',
    selector: (row: ListMassive) => row.upDate,
    cell: (row: ListMassive) => getElement(row.upDate),
    sortable: true,
  },
  {
    id: 'fileExt',
    name: 'Tipo de archivo',
    selector: (row: ListMassive) => row.fileExt,
    cell: (row: ListMassive) => getElement(row.fileExt),
    sortable: true
  },
  {
    id: 'totalFolios',
    name: 'Total Folios',
    selector: (row: ListMassive) => row.totalFolios,
    cell: (row: ListMassive) => row.totalFolios,
    sortable: true
  },
  {
    id: 'observaciones',
    name: 'Observaciones',
    selector: (row: ListMassive) => row.observaciones,
    cell: (row: ListMassive) => getElement(row.observaciones),
    sortable: true
  },
  {
    id: 'totalCorrect',
    name: 'Folios Correctos',
    selector: (row: ListMassive) => row.totalCorrect,
    cell: (row: ListMassive) => row.totalCorrect,
    sortable: true
  },
  {
    id: 'totalIncorrect',
    name: 'Folios Incorrectos',
    selector: (row: ListMassive) => row.totalIncorrect,
    cell: (row: ListMassive) => row.totalIncorrect,
    sortable: true
  },
  {
    id: 'report',
    name: 'Descargar Reporte',
    selector: (row: ListMassive) => row.report,
    cell: (row: ListMassive) => row.report,
  },
]

export const fluxDataColumns = [
  {
    id: 'fluxID',
    name: 'ID Flujo',
    selector: (row: ListFluxes) => row.fluxID,
    cell: (row: ListFluxes) => getElement(row.fluxID.toString()),
    sortable: true
  },
  {
    id: 'companyName',
    name: 'Razón Social',
    selector: (row: ListFluxes) => row.companyName,
    cell: (row: ListFluxes) => getElement(row.companyName),
    sortable: true
  },
  {
    id: 'upDate',
    name: 'Fecha de Alta',
    selector: (row: ListFluxes) => row.upDate,
    cell: (row: ListFluxes) => getElement(row.upDate),
    sortable: true,
  },
  {
    id: 'fluxMedia',
    name: 'Medio Electrónico',
    selector: (row: ListFluxes) => row.fluxMedia,
    cell: (row: ListFluxes) => getElement(row.fluxMedia),
    sortable: true
  },
  {
    id: 'fluxStatus',
    name: 'Estatus',
    selector: (row: ListFluxes) => row.fluxStatus,
    cell: (row: ListFluxes) => row.fluxStatus,
    sortable: true
  },
  {
    id: 'observations',
    name: 'Observaciones',
    selector: (row: ListFluxes) => row.observations,
    cell: (row: ListFluxes) => getElement(row.observations),
    sortable: true
  }
]

export const specialConsultDataColumns = [
  {
    id: 'id',
    name: 'ID',
    selector: (row: ListSpecials) => row.id,
    cell: (row: ListSpecials) => getElement(row.id.toString()),
    sortable: true
  },
  {
    id: 'consultNumber',
    name: 'Número Otorgante',
    selector: (row: ListSpecials) => row.consultNumber,
    cell: (row: ListSpecials) => getElement(row.consultNumber),
    sortable: true
  },
  {
    id: 'lastUpdate',
    name: 'Última Actualización',
    selector: (row: ListSpecials) => row.lastUpdate,
    cell: (row: ListSpecials) => getElement(row.lastUpdate),
    sortable: true,
  },
  {
    id: 'consultType',
    name: 'Tipo de Autorización',
    selector: (row: ListSpecials) => row.consultType,
    cell: (row: ListSpecials) => getElement(row.consultType),
    sortable: true,
  },
  {
    id: 'upDate',
    name: 'Fecha de Alta',
    selector: (row: ListSpecials) => row.upDate,
    cell: (row: ListSpecials) => getElement(row.upDate),
    sortable: true,
  },
  {
    id: 'period',
    name: 'Periodo de Solicitud',
    selector: (row: ListSpecials) => row.period,
    cell: (row: ListSpecials) => row.period,
    sortable: true,
  },
  {
    id: 'status',
    name: 'Estatus',
    selector: (row: ListSpecials) => row.status,
    cell: (row: ListSpecials) => row.status,
    sortable: true
  },
  {
    id: 'viewFile',
    name: 'Reporte de Solicitud',
    selector: (row: ListSpecials) => row.viewFile,
    cell: (row: ListSpecials) => row.viewFile,
  },
]

export const modalComponentStyles = {
  overlay: {
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '99',
    background: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    margin: '0',
    padding: '0',
    boxShadow: 'rgb(0 0 0 / 24%) 0 3px 8px',
    borderRadius: '.5rem',
    maxHeight: '100dvh',
    maxWidth: '100dvw',
    position: 'relative',
    inset: '0',
    border: 'none',
    overflow: 'hidden',
  },
}

export const sideBarItems = [
  { id: Texts.FIRST_TAB, src: calendar },
  { id: Texts.MASSIVE_UPLOAD, src: upload },
  { id: Texts.FLUXES_UPLOAD, src: workflow },
  { id: Texts.SPECIAL_REQUESTS, src: signature }
]

export const mediaType = [
  {
    claveMedio: 'totalPendientesDeAuditar',
    descMedio: 'Pendientes De Auditar'
  },
  {
    claveMedio: 'totalEntregadas',
    descMedio: 'Entregadas'
  },
  {
    claveMedio: 'totalRechazadas',
    descMedio: 'Rechazadas'
  },
  {
    claveMedio: 'totalAuditadas',
    descMedio: 'Auditadas'
  },
  {
    claveMedio: 'Todas',
    descMedio: 'Todas'
  }
]