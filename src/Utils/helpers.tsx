import {
  denied as Denied,
  pendant as Pending,
  success as Success,
  update as Update,
  processing as Process
} from '../assets/images'
import { toast } from 'react-toastify'
import { isNil } from 'lodash'

export const dateTransform = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const plusMonth = month + 1
  const formattedDate = `${year}-${plusMonth < 10 ? '0'+plusMonth : plusMonth}-${day < 10 ? '0'+day : day}`;
  return formattedDate;
}

const convertToMonth = (value: string) => {
  let letra;
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const numberMonth = parseInt(value);
  if(numberMonth >= 1  && numberMonth <= 12 ) {
    letra = months[numberMonth - 1];
  };
  return letra;
}

export const assignPeriodDate = (dates: {fechaInicio: string, fechaFin?: string}, explicitDate?: boolean) => {
  const { fechaInicio, fechaFin } = dates
  if (fechaInicio) {
    const init = fechaInicio.split('-');
    const initialMonth = convertToMonth(init[1]);
    if (fechaFin) {
      const fin = fechaFin.split('-');
      const finalMonth = convertToMonth(fin[1]);
      if (explicitDate) return `${init[2]} de ${initialMonth} de ${init[0]} Al ${fin[2]} de ${finalMonth} de ${fin[0]}`
      return `${initialMonth}/${init[0]} - ${finalMonth}/${fin[0]}`
    }
    if (explicitDate) return `${init[2]} de ${initialMonth} de ${init[0]}`
    return `${initialMonth}/${init[0]}`
  } else return `- - - - -`
}

export const validateActualDate = (date: Date) => {
  const actualDate = new Date()
  const { day: actualDay, month: actualMonth, year: actualYear } = {
    year: actualDate.getFullYear(),
    month: actualDate.getMonth() + 1,
    day: actualDate.getDate()
  }
  const { day, month, year } = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  }
  let toModified = new Date(date)
  const isToday = year === actualYear && month === actualMonth && day === actualDay
  if (isToday && actualDay !== 1) toModified.setDate(day - 1)
  else { toModified = new Date(year, month - 1, 0) }
  return {
    isExactToday: isToday,
    date: isToday ? toModified : date
  }
}

export const sendToastMessage = ({
  position = "top-right",
  message,
  type,
  theme = 'colored',
  hideProgressBar = true,
  closeButton = true,
  closeOnClick = true,
  closeTimer,
  progress,
  optionalComponent,
  icon,
}: {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  message?: string;
  type: 'error' | 'success' | 'warning' | 'info';
  theme?: 'colored' | 'light' | 'dark'
  hideProgressBar?: boolean
  closeButton?: boolean
  closeOnClick?: boolean
  closeTimer?: number;
  progress?: number;
  optionalComponent?: JSX.Element;
  icon?: JSX.Element
}) => {
  let responseMessage = optionalComponent ?? message
  return toast[type](responseMessage, {
    position,
    autoClose: closeTimer ?? false,
    hideProgressBar: hideProgressBar,
    closeButton: closeButton,
    closeOnClick: closeOnClick,
    pauseOnHover: false,
    draggable: false,
    progress,
    theme,
    icon
  })
}

export const sendAppError = (e: unknown) => {
  let error
  if (typeof e === "string") {
      error = e
  } else if (e instanceof Error) {
      error = e.message
  }
  return sendToastMessage({ type: 'error', message: error })
}

export type DownloadFile = (
  params: {
    fileName: string
    blob?: Blob
    url?: string
  }
) => void

export const downloadFile: DownloadFile = ({
  blob,
  fileName,
  url = null,
}) => {
  let href = url

  if (!isNil(blob)) href = URL.createObjectURL(blob)
  
  if (isNil(href)) return
  
  const link = document.createElement('a')

  link.href = href
  link.download = fileName

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)

  URL.revokeObjectURL(href)
}

export const formatDate = (date = new Date()) => date.toISOString().split('T')[0];
export const getInitials = (userName: string) => {
  if(userName === '') return 'LI';
  const [name, ...rest] = userName.split(/\s+/)
  const firstName = name.slice(0, 1)
  const lastName = rest[rest.length - 1]?.slice(0,1) || ''
  return `${firstName}${lastName}`.toUpperCase().trim()
}
export const formatNumber = new Intl.NumberFormat('en-US')
export const getElement = (text: string) => <div title={text}>{text}</div>
export const getIconPerStatus = (status: string, text?: boolean) => {
  switch (status.toLowerCase()) {
    case 'pendiente':
    case 'pendiente de aprobar':
    case 'pendiente de resolver':
    case 'pendiente de auditar': return Pending;
    case 'fallida':
    case 'rechazada': return Denied;
    case 'completada':
    case 'aprobado':
    case 'reporte':
    case 'auditada': return Success;
    case 'en proceso': return Process;
    default: return Denied;
  }
}
export const getHasFileText = (hasFile: boolean) => !hasFile ? 'Subir documento' : 'Documento enviado'
export const getFileIcons = (hasFile: boolean) => !hasFile ? Update : Success
export const fileValidations = (
  file: File,
  maxSize: any,
  acceptedExtensions: string[],
) => {
  const sizeLimit = maxSize ? maxSize * 1024 : null
  const fileSize = file.size / 1024
  const nameSplit = file.name.split('.')
  const formattedName = nameSplit.length > 2 
  ? `${nameSplit.slice(0, nameSplit.length - 1).join('')}.${nameSplit.pop()}` : file.name
  const fileExt = formattedName.split('.')[1].toLowerCase()
  let thereIsError = false
  if (!acceptedExtensions.includes(`.${fileExt}`)){
    sendAppError('Este formato de archivo no es aceptado.')
    thereIsError = true
  }
  if (sizeLimit && (fileSize > sizeLimit)) {
    sendAppError('El archivo sobrepasa el tamaño permitido.')
    thereIsError = true
  }
  if (thereIsError) return
  return file
}
const verifyFileSize = (size: number) => {
  if (size >= 6 && size < 25) return 6
  if (size >= 25 && size < 100) return 10
  if (size >= 100 && size < 500) return 50
  if (size >= 500) return 100
  return 6
}
const obtainedPartsArray = (fileSize: number, optimalChunkSize: number, minPartSize: number) => {
  
  if (fileSize <= optimalChunkSize) return [fileSize]

  const parts = []
  let uploadedBytes = 0

  while (uploadedBytes < fileSize) {
    let currentPartSize = optimalChunkSize
    const remainingBytes = fileSize - uploadedBytes

    if (remainingBytes < optimalChunkSize) currentPartSize = remainingBytes

/*     if (currentPartSize < minPartSize && parts.length > 0) {
      parts[parts.length - 1] += currentPartSize
      break
    } */

    parts.push(currentPartSize)
    uploadedBytes += currentPartSize
  }

  return parts;
}
export const obtainOptimalChunk = (fileSize: number) => {
  const fileSizeInMB = fileSize / (1024 * 1024)
  const optimalSize = verifyFileSize(fileSizeInMB)

  const remainder = fileSize % optimalSize
  const chunkSizeMB = remainder > 0 ? remainder + 6 : optimalSize 
  const referenceChunkSize = (chunkSizeMB) * 1048576
  const totalChunks = obtainedPartsArray(fileSize, referenceChunkSize, (6 * 1024 * 1024))

  return {chunkSize: referenceChunkSize, totalParts: totalChunks}
}
export const getFileType = (type: string) => {
  const fileType = type.split('/')[1]
  if (fileType.includes('.plain')) return 'TXT'
  if (fileType.includes('.excel')) return 'XLS'
  if (fileType.includes('.document')) return 'DOCX'
  if (fileType.includes('.presentation')) return 'PPTX'
  if (fileType.includes('.spreadsheetml')) return 'XLSX'

  return fileType.toUpperCase()
}
export const reviewDetailsData = (
  upDate: string,
  status: string,
  beginProcess: string,
  dateComplete: string,
  dateExpired: string,
  dateFailed: string,
  detailViewFile: boolean
) => {
  let arrayOfData
  arrayOfData = [{
    name: 'Estatus Inicial',
    text: 'Se creó la Solicitud Especial con éxito.',
    date: assignPeriodDate({fechaInicio: upDate}, true),
    color: 'default'
  },{
    name: 'Pendiente de Resolver',
    text: 'La Solicitud se encuentra en espera de ser atendida.',
    date: assignPeriodDate({fechaInicio: upDate}, true),
    color: 'pending'
  }]
  if (status !== 'Pendiente' && beginProcess) arrayOfData.push({
    name: 'En proceso',
    text: 'La Solicitud comenzó a ser procesada.',
    date: assignPeriodDate({fechaInicio:beginProcess.slice(0, 10)}, true),
    color: 'process'
  })
  if (status === 'Completada') arrayOfData.push({
    name: 'Completada',
    text: 'La Solicitud fue completada con éxito y se está generando el reporte.',
    date: assignPeriodDate({fechaInicio:dateComplete.slice(0, 10)}, true),
    color: 'success'
  }, {
    name: 'Reporte',
    text: 'El reporte se encuentra disponible para la descarga.',
    date: assignPeriodDate({fechaInicio:dateComplete.slice(0, 10)}, true),
    color: 'success'
  })
  if (status === 'Completada' && !detailViewFile) arrayOfData.push({
    name: 'Caducado',
    text: 'Archivo de reporte no disponible, por favor crea otra solicitud.',
    date: assignPeriodDate({fechaInicio:dateExpired.slice(0, 10)}, true),
    color: 'pending'
  })
  if (status === 'Fallida') arrayOfData.push({
    name: 'Fallida',
    text: 'La Solicitud no pudo ser procesada de manera correcta.',
    date: assignPeriodDate({fechaInicio:dateFailed.slice(0, 10)}, true),
    color: 'error'
  })
  return arrayOfData
}

export const getBrowser = () => {
  const userAgent = navigator.userAgent;

  let browserName = "Unknown";

  if (userAgent.includes("Firefox")) {
    browserName = "Firefox";
  } else if (userAgent.includes("Chrome") && !userAgent.includes("Edg") && !userAgent.includes("OPR")) {
    // Exclude Edge (Edg) and Opera (OPR) which also contain "Chrome" in their UA
    browserName = "Chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    // Exclude Chrome which also contains "Safari" in its UA
    browserName = "Safari";
  } else if (userAgent.includes("Edg")) {
    browserName = "Edge";
  } else if (userAgent.includes("OPR")) {
    browserName = "Opera";
  } else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) {
    browserName = "Internet Explorer";
  }
 return browserName;
}

export const cleanPhoneData = (phone: string = '+5227-12-25-03-94') => {
  const noHyphens = phone.split('-').join('')
  const cleanString = noHyphens.slice(noHyphens.length - 10, noHyphens.length)
  return cleanString
}