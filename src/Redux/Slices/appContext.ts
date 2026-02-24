import { createSlice } from '@reduxjs/toolkit'
import { Texts } from '../constants';

const initialState = {
  appFluxContext: {
    selectedDates: {
      startDate: '',
      endDate: '',
    },
    specialConsultDates: {
      startDate: '',
      endDate: '',
    },
    specialRequestTopCall: false,
    actualTab: Texts.FIRST_TAB,
    progress: 0,
    toastID: null,
    abortSignalS3: false,
    saveMultipartData: {
      Bucket: '',
      UploadId: '',
      Key: ''
    },
    activeFileUpload: '',
    authCancel: false,
    loadingData: false,
    tableLoader: false,
    uploadLoader: false,
    totalTableRows: 0,
    controlFigs: {
      allConsults: 0,
      pending: 0,
      delivered: 0,
      rejected: 0,
      audit: 0,
      required: 0,
    },
    mediaAll: [{idMedia: '0', descMedia: ''}],
    consultsList: [{
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
    }],
    changePeriods: {
      actualPeriod: 0,
      availability: false,
      startPeriodDate: '',
      periodEnds: {
        ['' as string]: ''
      },
      expirationPeriod: '',
    },
    fluxes: {
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
    },
    statusMassive: [{
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
    }],
    specialRequestStatus: [{
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
    }],
    specialRequestDetails: [{
      requestStatus: '',
      dateComplete: '',
      dateFailed: '',
      beginProcess: '',
      moreDetails: '',
      idRequest: 0,
      detailViewFile: false,
      dateExpired: ''
    }],
    consultant: {
      status: '',
      type: '',
      periods: [{startDate: '', endDate: ''}],
      media: [{idMedia: 0, descMedia: ''}],
      shortName: '',
      companyName: ''
    },
    liferayUser: {
      data: {
        nameUser: '',
        contexts: [{}],
        numOtorgante: Texts.DEFAULT_CONSULT_NUMBER,
        permisos: [{}],
        token: '',
        userId: 0,
      },
      properties: {
        CDC_ID_AUD: '',
        CDC_SEC_AUD: '',
        CDC_URL_AUD: '',
        CDC_AWS_AUD: '',
        CDC_SPW_HDK: '',
        CDC_WAP_AUD: '',
        CDC_IFB_AUD: '',
        CDC_EKY_AUD: ''
      }
    },
    noInfoRequest: false,
    generalLoader: false,
  },
  errors: [{
    url: '',
    code: 0,
    message: '',
    active: false,
  }]
};

export const appContextSlice = createSlice({
  name: 'App Context State',
  initialState,
  reducers: {
    SAVE_APP_FLUX: (state, action) => {
      return {
        ...state,
        appFluxContext: {
          ...state.appFluxContext,
          ...action.payload
        }
      }
    },
    SAVE_ERRORS: (state, action) => {
      return {
        ...state,
        errors: action.payload
      }
    }
  }
})

export const { 
  SAVE_APP_FLUX,
  SAVE_ERRORS
} = appContextSlice.actions;
export default appContextSlice.reducer;