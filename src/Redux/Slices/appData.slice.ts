import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { 
  AbortMultipartS3,
  CloseMultipartS3,
  ContentType,
  InitMultipartParams,
  RootState,
  S3UploadProps,
  UploadChunks
} from '..'
import { cleanPhoneData, sendToastMessage } from '../../Utils'
import { Mutex } from 'async-mutex'
import { isEmpty } from 'lodash'
import CryptoJS from 'crypto-js'

const mutex = new Mutex()
const baseUrl = 'http://desarrollo:7002/auditoria-firmas/'
const rawBaseQuery = fetchBaseQuery({ baseUrl })
const s3BaseQuery = fetchBaseQuery({ baseUrl: '' })

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock()
  let resultBaseQuery
  if (window.Liferay) {
    if (window.Liferay?.Session?.get('sessionState') === 'expired') {
      sendToastMessage({
        message: 'Su sesión ha expirado por favor vuelva a iniciar sesión.',
        type: 'warning'
      })
      setTimeout(() => {window.location.reload()}, 5000)
      return { data: null }
    }
    const {
      app: {
        appFluxContext: {
          liferayUser: {
            properties: { CDC_ID_AUD, CDC_SEC_AUD, CDC_SPW_HDK, CDC_URL_AUD },
            data: { token }
          }
        }
      }
    } = api.getState() as RootState
    const signRequestByKey = (request: any) => {
      const key  = CryptoJS.enc.Latin1.parse(CDC_SPW_HDK)
      const iv   = CryptoJS.enc.Latin1.parse(CDC_SPW_HDK)
      const encrypted = CryptoJS.AES.encrypt(request, key, {
        iv:iv,
        mode:CryptoJS.mode.CBC,
        padding:CryptoJS.pad.ZeroPadding
      });
      return encrypted.toString();
    }
    const body = `grant_type=client_credentials&client_id=${CDC_ID_AUD}&client_secret=${CDC_SEC_AUD}`
    const adjustedArgs = typeof args === 'string' ? args : {
      ...args,
      body,
      url: CDC_URL_AUD + '/oauth2/token',
      method: 'POST',
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
    const { data }: any = await rawBaseQuery(
      adjustedArgs,
      api,
      extraOptions)
    const authTokenSerialized = data.token_type + " " + data.access_token
    const addedToken = typeof args === "string" ? args : {
      ...args,
      body: {...args.body, origen: 'EXTERNO'},
      url: CDC_URL_AUD + '/auditoria-firmas/' + args.url,
      headers: {
        'Authorization': authTokenSerialized,
        'token': token ?? '',
        'signature': signRequestByKey(JSON.stringify(args.body))
      }
    }
    resultBaseQuery = rawBaseQuery(addedToken, api, extraOptions)
  } else {
    await mutex.waitForUnlock()
    const addedToken = typeof args === "string" ? args : {
      ...args,
      body: {...args.body, origen: 'EXTERNO'},
      headers: { 'Authorization': 'hola' }
    }
    resultBaseQuery = rawBaseQuery(addedToken, api, extraOptions)
  }
  return resultBaseQuery
}

const dynamicS3BaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock()
  let resultBaseQuery
  if (api.endpoint === 'initMultipartS3' || api.endpoint === 's3UploadFile') {
    sendToastMessage({
      type: 'info',
      message: `Comenzó la carga del archivo "${typeof args !== 'string' && args.body.nombre}", por favor espere.`,
      closeTimer: 3500,
      position: 'bottom-right'
    })
  }
  if (window.Liferay) {
    if (window.Liferay?.Session?.get('sessionState') === 'expired') {
      sendToastMessage({
        message: 'Su sesión ha expirado por favor vuelva a iniciar sesión.',
        type: 'warning'
      })
      setTimeout(() => {window.location.reload()}, 5000)
      return { data: null }
    }
    const { app: { appFluxContext: {
      liferayUser: {
        properties: {CDC_AWS_AUD},
        data: {token}
      }
    }}} = api.getState() as RootState
    const adjustedArgs = typeof args === 'string' ? args : {
      ...args,
      url: args.url.includes('https') ? args.url : CDC_AWS_AUD + '/' + args.url,
      headers: args.url.includes('https') ? { "Content-Type": "" } : {
        "Content-Type": "application/json",
        "x-jwt-token": token ?? ''
      }
    }
    resultBaseQuery = s3BaseQuery(
      adjustedArgs,
      api,
      extraOptions
    )
  } else {
    await mutex.waitForUnlock()
    resultBaseQuery = s3BaseQuery(args, api, extraOptions)
  }
  return resultBaseQuery
}

export const apiSlice = createApi({
  reducerPath: 'apiRequest',
  baseQuery: dynamicBaseQuery,
  endpoints: builder => ({
    getLoggedUserInfo: builder.query<any, { numeroOtorgante: string }>({
      query: initialLoad => ({
        url: 'catalogo/otorgantes',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        otorgantes: {
          estatus: string;
          tipoOtorgante: string;
          periodos: {fechaInicio?: string; fechaFin?: string;}[],
          medios: {idMedioElectronico: number; descMedioElectronico: string;}[],
          nombreCorto: string;
          razonSocial: string;
          email: string;
          telefono: string;
        }[]}, meta, arg) => {
        if (!response || !response.otorgantes) throw new Error('Ocurrió un error.')
        let consultant: any[];
        if (response.otorgantes.length === 0) {
          consultant = [{
            status: '',
            type: '',
            periods: [{startDate: '', endDate: ''}],
            media: [{idMedia: 0, descMedia: ''}],
            shortName: '',
            companyName: '',
            email: '',
            phone: ''
          }]
        } else {
          consultant = response.otorgantes.map((file) => ({
            status: file.estatus ?? '',
            type: file.tipoOtorgante ?? '',
            periods: file.periodos.length ? file.periodos.map(period => ({
              startDate: period.fechaInicio,
              endDate: period.fechaFin
            })) : [{startDate: '', endDate: ''}],
            media: file.medios.length ? file.medios.map((media) => ({
              idMedia: media.idMedioElectronico,
              descMedia: media.descMedioElectronico
            })) : [{idMedia: 0, descMedia: ''}],
            shortName: file.nombreCorto ?? '',
            companyName: file.razonSocial ?? '',
            email: atob(file.email) ?? '',
            phone: cleanPhoneData(atob(file.telefono)) ?? ''
          }))
        }
        return consultant[0]
      },
      transformErrorResponse: (error: any) => ({
        url: 'catalogo/otorgantes',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    getAllMedia: builder.query<any, {}>({
      query: initialLoad => ({
        url: 'catalogo/mediosElectronicos',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        mediosElectronicos: {claveMedio: string; descMedio: string;}[]
      }) => {
        if (!response) throw new Error('Ocurrió un error.')
        let mediaAll: any[];
        if (response.mediosElectronicos.length === 0) {
          mediaAll = [{idMedia: '0', descMedia: ''}]
        } else {
          mediaAll = response.mediosElectronicos.length ? response.mediosElectronicos.map(media => ({idMedia: media.claveMedio, descMedia: media.descMedio})) : [{idMedia: '0', descMedia: ''}]
        }
        return mediaAll
      },
      transformErrorResponse: (error: any) => ({
        url: 'catalogo/mediosElectronicos',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    getControlFigs: builder.query<any, {numeroOtorgante: string;fechaInicio: string;fechaFin: string;}>({
      query: initialLoad => ({
        url: 'cifrasControl',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        cifrasControl: {
          totalConsultas: number;
          totalRequeridas: number;
          totalEntregadas: number;
          totalPendientes: number;
          totalPendientesDeAuditar: number;
          totalAuditadas: number;
          totalRechazadas: number;
        }
      }) => {
        if (!response) throw new Error('Ocurrió un error.')
        let controlFigs = {}
        if (response.cifrasControl.totalConsultas === 0) {
          controlFigs = {
            allConsults: 0,
            pending: 0,
            delivered: 0,
            rejected: 0,
            audit: 0,
            required: 0,
          }
        } else {
          controlFigs = {
            allConsults: response.cifrasControl.totalConsultas ?? 0,
            pending: response.cifrasControl.totalPendientesDeAuditar ?? 0,
            delivered: response.cifrasControl.totalEntregadas ?? 0,
            rejected: response.cifrasControl.totalRechazadas ?? 0,
            audit: response.cifrasControl.totalAuditadas ?? 0,
            required: response.cifrasControl.totalRequeridas ?? 0,
          }
        }
        return controlFigs
      },
      transformErrorResponse: (error: any) => ({
        url: 'cifrasControl',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    getChangePeriodInfo: builder.query<any, { numeroOtorgante: string }>({
      query: initialLoad => ({
        url: 'periodos/info',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        infoPeriodo: {
          cambioPeriodo: boolean;
          periodoActual: number;
          diaInicioPeriodo: string;
          finPeriodo: {[key: string]:string};
          vencimientoPeriodo?: string;
      }
      }) => {
        if (!response) throw new Error('Ocurrió un error.')
        let changePeriods = {}
        if (isEmpty(response.infoPeriodo)){
          changePeriods = {
            actualPeriod: 0,
            availability: false,
            startPeriodDate: '',
            periodEnds: {
              ['' as string]: ''
            },
            expirationPeriod: '',
          }
        } else {
          changePeriods = {
            actualPeriod: response.infoPeriodo.periodoActual ?? 0,
            availability: response.infoPeriodo.cambioPeriodo ?? false,
            startPeriodDate: response.infoPeriodo.diaInicioPeriodo ?? '',
            periodEnds: response.infoPeriodo.finPeriodo ?? {['' as string]: ''},
            expirationPeriod: response.infoPeriodo.vencimientoPeriodo ?? '',
          }
        }
        return changePeriods
      },
      transformErrorResponse: (error: any) => ({
        url: 'periodos/info',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    requestChangePeriod: builder.query<any, {numeroOtorgante: string;nuevoPeriodo: number; userId: number}>({
      query: body => ({
        url: 'periodos/cambiar',
        method: 'POST',
        body
      }),
      transformResponse: (res: {
        cambioPeriodo: {
          autorizado: boolean;
          mensajeCambio: string;
        }
      }) => {
        if(!res) throw new Error('Ocurrió un error.')

        return {
          changeCorrect: res.cambioPeriodo.autorizado ?? false,
          message: res.cambioPeriodo.mensajeCambio ?? ''
        }
      },
      transformErrorResponse: (error: any) => ({
        url: 'periodos/cambiar',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    getMassiveFileInfo: builder.query<any, { numeroOtorgante: string }>({
      query: initialLoad => ({
        url: 'obtener/datosZip',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        datosCargaMasiva: {
          id: number;
          numeroOtorgante: string;
          nombreCorto: string;
          razonSocial: string;
          nombreArchivo: string;
          totalArchivos: number;
          totalCorrectos: number;
          totalErrores: number;
          fechaAlta: string;
          observaciones: string;
          tipoAuditoria: string;
          tipoArchivo: string;
        }[]
      }) => {
        if (!response || !response.datosCargaMasiva) throw new Error('Ocurrió un error.')
        let statusMassive = []
        if (response.datosCargaMasiva.length === 0){
          statusMassive = [{
            idStatus: 0,
            consultNumber: '',
            fileName: '',
            auditType: '',
            fileExt: '',
            upDate: '',
            totalFolios: 0,
            observaciones: '',
            totalCorrect: 0,
            totalIncorrect: 0,
            report: false,
          }]
        } else {
          statusMassive = response.datosCargaMasiva.length ? response.datosCargaMasiva.map(data => ({
              idStatus: data.id ?? 0,
              consultNumber: data.numeroOtorgante ?? '',
              fileName: data.nombreArchivo ?? '',
              auditType: data.tipoAuditoria ?? '',
              fileExt: data.tipoArchivo ?? '',
              upDate: data.fechaAlta ?? '',
              observaciones: data.observaciones ?? '',
              totalFolios: data.totalArchivos ?? 0,
              totalCorrect: data.totalCorrectos ?? 0,
              totalIncorrect: data.totalErrores ?? 0,
              report: false,
          })) : [{
            idStatus: 0,
            consultNumber: '',
            fileName: '',
            auditType: '',
            fileExt: '',
            upDate: '',
            totalFolios: 0,
            observaciones: '',
            totalCorrect: 0,
            totalIncorrect: 0,
            report: false,
          }]
        }
        return statusMassive
      },
      transformErrorResponse: (error: any) => ({
        url: 'obtener/datosZip',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    getFluxesInfo: builder.query<any, { numeroOtorgante: string }>({
      query: initialLoad => ({
        url: 'flujos/obtener',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        flujosOtorgantes: {
          idFlujo: number;
          numeroOtorgante: string;
          nombreCorto: string;
          razonSocial: string;
          medioElectronico: string;
          estatusFlujo: string;
          observaciones: string;
          fechaAlta: string;
        }[]
      }) => {
        if (!response) throw new Error('Ocurrió un error.')
        let fluxes = {}
        if (response.flujosOtorgantes.length === 0){
          fluxes = {
            dataFluxes: [{
              fluxStatus: '',
              upDate: '',
              fluxID: 0,
              fluxMedia: '',
              fluxShortName: '',
              observations: '',
              companyName: ''
            }],
            countFluxes: {
              approved: 0,
              pending: 0,
              rejected: 0,
            },
            flagAuth: 0
          }
        } else {
          fluxes = {
            dataFluxes: response.flujosOtorgantes.map(flux => ({
                fluxStatus: flux.estatusFlujo ?? '',
                upDate: flux.fechaAlta ?? '',
                fluxID: flux.idFlujo ?? 0,
                fluxMedia: flux.medioElectronico ?? '',
                fluxShortName: flux.nombreCorto ?? '',
                observations: flux.observaciones ?? '',
                companyName: flux.razonSocial ?? ''
            })),
            countFluxes: {
              approved: response.flujosOtorgantes.filter((flux) => flux.estatusFlujo === 'Aprobado').length ?? 0,
              pending: response.flujosOtorgantes.filter((flux) => flux.estatusFlujo === 'Pendiente de aprobar').length ?? 0,
              rejected: response.flujosOtorgantes.filter((flux) => flux.estatusFlujo === 'Rechazado').length ?? 0,
            },
            flagAuth: response.flujosOtorgantes.filter(flux => flux.estatusFlujo === 'Aprobado' && flux.medioElectronico === 'FIRMA AUTÓGRAFA').length ?? 0
          }
        }
        return fluxes
      },
      transformErrorResponse: (error: any) => ({
        url: 'flujos/obtener',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    getSpecialConsultInfo: builder.query<any, { numeroOtorgante: string }>({
      query: initialLoad => ({
        url: 'especiales/obtener',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        solicitudesEspeciales: {
          idSolicitud: number;
          numeroOtorgante: string;
          nombreCorto: string;
          razonSocial: string;
          fechaInicio: string;
          fechaFin: string;
          tipoEstatusConsulta: string;
          estatusSolicitud: string;
          fechaAlta: string;
          ultimaActualizacion: string;
          refArchivo: string;
          eTag: string;
          visualizarArchivo: boolean;
          archivoResguardado: boolean;
          nombreArchivo: string;
          fechaResguardo: string;
        }[]
      }) => {
        if (!response) throw new Error('Ocurrió un error.')
        let specialRequestStatus = []
        if (response.solicitudesEspeciales.length === 0){
          specialRequestStatus = [{
            id: 0,
            status: '',
            upDate: '',
            period: {
                start: '',
                end: ''
            },
            consultNumber: '',
            companyName: '',
            shortName: '',
            consultType: '',
            fileName: '',
            lastUpdate: '',
            eTag: '',
            fileRef: '',
            viewFile: false
          }]
        } else {
          specialRequestStatus = response.solicitudesEspeciales.map(special => ({
            id: special.idSolicitud ?? 0,
            status: special.estatusSolicitud ?? '',
            upDate: special.fechaAlta ?? '',
            period: {
                start: special.fechaInicio ?? '',
                end: special.fechaFin ?? ''
            },
            consultNumber: special.numeroOtorgante ?? '',
            companyName: special.razonSocial ?? '',
            shortName: special.nombreCorto ?? '',
            consultType: special.tipoEstatusConsulta ?? '',
            fileName: special.nombreArchivo ?? '',
            lastUpdate: special.ultimaActualizacion ?? '',
            eTag: special.eTag ?? '',
            fileRef: special.refArchivo ?? '',
            viewFile: special.visualizarArchivo ?? false
          }))
        }
        return specialRequestStatus
      },
      transformErrorResponse: (error: any) => ({
        url: 'especiales/obtener',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    specialConsultNewRequest: builder.query<any, any>({
      query: initialLoad => ({
        url: 'especiales/alta',
        method: 'POST',
        body: initialLoad
      }),
      transformErrorResponse: (error: any) => ({
        url: 'especiales/alta',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    getConsultsList: builder.query<any, {numeroOtorgante: string;fechaInicio: string;fechaFin: string;estatus: string;tipoOtorgante: string;}>({
      query: initialLoad => ({
        url: 'obtenerConsultas',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        consultas: {
          archivo: boolean;
          claveEstatus: string;
          claveProducto: string;
          estatus: string;
          fechaConsulta: string;
          folioCdc: string;
          folioOtorgante: string;
          nombreCliente: string;
          numeroFirma: string;
          producto: string;
          motivoRechazo: string;
          observaciones: string;
          permitirActualizacion: boolean;
        }[]
      }) => {
        if (!response) throw new Error('Ocurrió un error.')
        let consultsList = []
        if (response.consultas.length === 0) {
          consultsList = [{
            cdcFolio: '',
            hasFile: false,
            statusKey: '',
            productKey: '',
            status: '',
            consultDate: '',
            consultantFolio: '',
            nameClient: '',
            signNumber: '',
            product: '',
            rejectReason: '',
            remarks: '',
            allowUpdate: false
          }]
        } else {
          consultsList = response.consultas.map(consult => ({
            cdcFolio: consult.folioCdc,
            hasFile: consult.archivo,
            statusKey: consult.claveEstatus,
            productKey: consult.claveProducto,
            status: consult.estatus,
            consultDate: consult.fechaConsulta,
            consultantFolio: consult.folioOtorgante,
            nameClient: consult.nombreCliente,
            signNumber: consult.numeroFirma,
            product: consult.producto,
            rejectReason: consult.motivoRechazo,
            remarks: consult.observaciones,
            allowUpdate: consult.permitirActualizacion
          }))
        }
        return consultsList
      },
      transformErrorResponse: (error: any) => ({
        url: 'obtenerConsultas',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    getSpecialDetail: builder.query<any, { idSolicitud: number }>({
      query: initialLoad => ({
        url: 'especiales/detalle',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (res: {
        detalleSolicitudEsp: {
          idSolicitud: number;
          estatusSolicitud: string;
          fechaProceso: string;
          fechaCompletada: string;
          fechaFallida: string;
          observaciones: string;
          visualizarArchivo: boolean;
          fechaResguardo: string;
        }
      }) => {
        if (!res) return new Error('Ocurrió un error')
        return {
          requestStatus: res.detalleSolicitudEsp.estatusSolicitud ?? '',
          dateComplete: res.detalleSolicitudEsp.fechaCompletada ?? '',
          dateFailed: res.detalleSolicitudEsp.fechaFallida ?? '',
          beginProcess: res.detalleSolicitudEsp.fechaProceso ?? '',
          moreDetails: res.detalleSolicitudEsp.observaciones ?? '',
          idRequest: res.detalleSolicitudEsp.idSolicitud ?? 0,
          detailViewFile: res.detalleSolicitudEsp.visualizarArchivo ?? false,
          dateExpired: res.detalleSolicitudEsp.fechaResguardo ?? ''
        }
      },
      transformErrorResponse: (error: any) => ({
        url: 'especiales/detalle',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    downloadConsultsReport: builder.query<any, {numeroOtorgante: string;fechaInicio: string;fechaFin: string;estatus: string;tipoOtorgante: string;}>({
      query: initialLoad => ({
        url: 'reportes/obtenerConsultas',
        method: 'POST',
        body: initialLoad,
        responseHandler: res => res.url.includes('token') ? res.json() : res.arrayBuffer()
      }),
      transformResponse: (response: any) => {
        if (!response) throw new Error('Ocurrió un error.')
        const fileData = new Uint8Array(response)
        const blob = new Blob([fileData], { type: ContentType.XLSX_TYPE })
        const url = URL.createObjectURL(blob)
        return url ?? ''
      },
      transformErrorResponse: (error: any) => ({
        url: 'reporte/obtenerConsultas',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    downloadMassiveFileReport: builder.query<any, { id: number }>({
      query: initialLoad => ({
        url: 'reporte/datosZip',
        method: 'POST',
        body: initialLoad,
        responseHandler: res => res.url.includes('token') ? res.json() : res.arrayBuffer()
      }),
      transformResponse: (response: any) => {
        if (!response) throw new Error('Ocurrió un error.')
        const fileData = new Uint8Array(response)
        const blob = new Blob([fileData], { type: ContentType.XLSX_TYPE })
        const url = URL.createObjectURL(blob)
        return url ?? ''
      },
      transformErrorResponse: (error: any) => ({
        url: 'reporte/datosZip',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    }),
    downloadDictamen: builder.query<any, {numeroOtorgante: string; año: string,mes: string}>({
      query: initialLoad => ({
        url: 'reportes/dictamen/financiero',
        method: 'POST',
        body: initialLoad,
        responseHandler: res => res.url.includes('token') ? res.json() : res.arrayBuffer()
      }),
      transformResponse: (response: any) => {
        if (!response) throw new Error('Ocurrió un error.')
        const fileData = new Uint8Array(response)
        const blob = new Blob([fileData], { type: ContentType.XLSX_TYPE })
        const url = URL.createObjectURL(blob)
        return url ?? ''
      },
      transformErrorResponse: (error: any) => ({
        url: 'reportes/dictamen/financiero',
        code: error.status,
        message: error?.error ?? error?.data?.error ?? error?.data?.mensaje ?? error?.data?.errores[0]?.mensaje ?? error?.data?.mensajes[0],
        active: true,
      }),
    })
  })
})

export const S3Slice = createApi({
  reducerPath: 's3Request',
  baseQuery: dynamicS3BaseQuery,
  endpoints: builder => ({
    s3UploadFile: builder.query<any, S3UploadProps>({
      query: ({ esMasivo, folioCDC, nombre, numOtorgante, tipoAuditoria }) => ({
        url: 'upload',
        body: { numOtorgante, tipoAuditoria, esMasivo, folioCDC, nombre },
        method: 'POST'
      }),
      transformResponse: async (response: {
        fields: {
          "Content-Type": string;
          key: string;
          AWSAccessKeyId: string;
          "x-amz-security-token": string;
          policy: string;
          signature: string;
        },
        url: string;
      }, meta, arg) => {
        if (!response || !response.fields) throw new Error('Ocurrió un error.')
        const { fields, url } = response
        const formData = new FormData();
        formData.append("Content-Type", fields["Content-Type"]);
        formData.append("key", fields.key);
        formData.append("AWSAccessKeyId", fields.AWSAccessKeyId);
        formData.append("x-amz-security-token", fields["x-amz-security-token"]);
        formData.append("policy", fields.policy)
        formData.append("signature", fields.signature)
        formData.append("file", arg.file)
        if (window.Liferay) {
          if (window.Liferay?.Session?.get('sessionState') === 'expired') {
            sendToastMessage({
              message: 'Su sesión ha expirado por favor vuelva a iniciar sesión.',
              type: 'warning'
            })
            setTimeout(() => {window.location.reload()}, 5000)
            return
          }
        }
        await fetch(url, {
          body: formData,
          method: 'POST',
        }).then(() => sendToastMessage({
          message: `El archivo "${arg.file.name}" se envió con éxito.`,
          type: 'success',
          closeTimer: 4500,
          position: 'bottom-right'
        })).catch((e) => {throw new Error(e)})
      },
      transformErrorResponse: (error: any) => ({
        url: 'upload',
        code: error.status,
        message: error?.data?.error ?? error?.error,
        active: true,
      }),
    }),
    initMultipartS3: builder.query<any, InitMultipartParams>({
      query: initialLoad => ({
        url: 'crearMultipart',
        method: 'POST',
        body: initialLoad
      }),
      transformResponse: (response: {
        Bucket: string;
        UploadId: string;
        Key: string;
        urls: string[];
      }) => {
        if (!response || !response.Bucket) throw new Error('Ocurrió un error.')
        return response
      },
      transformErrorResponse: (error: any) => ({
        url: 'crearMultipart',
        code: error.status,
        message: error?.data?.error ?? error?.error ?? 'Ocurrió un error.',
        active: true,
      }),
    }),
    uploadChunks: builder.query<any, UploadChunks>({
      query: ({ url, chunk }) => ({
        url: url,
        method: 'PUT',
        body: chunk
      }),
      transformResponse: (response, meta: any) => {
        if (!meta)  throw new Error()
        return meta.response.headers.get('etag')
      },
      transformErrorResponse: (error: any) => ({
        url: 'chunkUpload',
        code: error.status,
        message: error?.data?.error ?? error?.error ?? 'Ocurrió un error.',
        active: true,
      }),
    }),
    closeMultipartS3: builder.query<any, CloseMultipartS3>({
      query: initialLoad => ({
        url: 'cerrarMultipart',
        method: 'POST',
        body: initialLoad,
      }),
      transformErrorResponse: (error: any) => ({
        url: 'cerrarMultipart',
        code: error.status,
        message: error?.data?.error ?? error?.error ?? 'Ocurrió un error.',
        active: true,
      }),
    }),
    abortMultipartS3: builder.query<any, AbortMultipartS3>({
      query: initialLoad => ({
        url: 'cancelarMultipart',
        method: 'POST',
        body: initialLoad
      }),
      transformErrorResponse: (error: any) => ({
        url: 'cancelarMultipart',
        code: error.status,
        message: error?.data?.error ?? error?.error ?? 'Ocurrió un error.',
        active: true,
      }),
    }),
    s3DownloadFile: builder.query<any, {eTag: string; key: string;}>({
      query: initialLoad => ({
        url: 'obtenerArchivo',
        body: initialLoad,
        method: 'POST'
      }),
      transformResponse: async (response: string) => {
        if (!response) throw new Error('Ocurrió un error.')
        let isNotFound = false
        const data = await fetch(response).then(response => {
          if (response.status === 404) isNotFound = true
          return response.blob()
        }).then(blob => URL.createObjectURL(blob))
        return { data, isNotFound }
      },
      transformErrorResponse: (error: any) => ({
        url: 'obtenerArchivo',
        code: error.status,
        message: error?.data?.error ?? error?.error ?? 'Ocurrió un error.',
        active: true,
      }),
    })
  })
})

export const {
  useGetLoggedUserInfoQuery,
  useGetAllMediaQuery,
  useGetControlFigsQuery,
  useGetChangePeriodInfoQuery,
  useRequestChangePeriodQuery,
  useGetMassiveFileInfoQuery,
  useGetFluxesInfoQuery,
  useGetSpecialConsultInfoQuery,
  useSpecialConsultNewRequestQuery,
  useGetConsultsListQuery,
  useGetSpecialDetailQuery,
  useDownloadMassiveFileReportQuery,
  useDownloadConsultsReportQuery,
  useDownloadDictamenQuery
} = apiSlice

export const {
  useS3UploadFileQuery,
  useInitMultipartS3Query,
  useUploadChunksQuery,
  useCloseMultipartS3Query,
  useAbortMultipartS3Query,
  useS3DownloadFileQuery
} = S3Slice