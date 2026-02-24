import { ApiEndpointQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, QueryDefinition } from "@reduxjs/toolkit/query";
import { ExpandableRowsComponent } from "react-data-table-component/dist/src/DataTable/types";
import { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { ElementRef, ReactNode, RefObject } from "react";
import { IDocument } from '@cyntler/react-doc-viewer';
import { TableRow } from "react-data-table-component";
import { RootState } from "./store";

export type PickOnly<T, K extends keyof T> = Pick<T, K> & { [P in Exclude<keyof T, K>]?: never };
export type AtMostTwoKeys<T> = (
  PickOnly<T, never> |
  { [K in keyof T]-?: PickOnly<T, K> |
      { [L in keyof T]-?:
          PickOnly<T, K | L> }[keyof T]
  }[keyof T]
) extends infer O ? { [P in keyof O]: O[P] } : never

export type ConsultNumber = { numOtorgante: string }
export type NameUser = { nameUser: string }
export type TypeUser = { type: string }
export type Periods = { startDate: string; endDate: string }
export type NormalObject = { name: string; value: number }
export type Progress = { progress: number }
export type FileData = {
  file: File;
  fileBase:  string;
  consultNumber: string;
  cdcNumber: string;
  fileName: string;
  isMassive: boolean;
  auditType: string;
  errorExcel: boolean;
  personType: string;
}
export type ControlFigs = {
  allConsults: number;
  pending: number;
  delivered: number;
  rejected: number;
  audit: number;
  required: number;
}
export type ListConsults = {
  hasFile: boolean;
  statusKey: string;
  productKey: string;
  status: string;
  consultDate: string;
  cdcFolio: string;
  consultantFolio: string;
  nameClient: string;
  signNumber: string;
  product: string;
  rejectReason: string;
  remarks: string;
  allowUpdate: boolean;
}
export type ListMassive = {
  idStatus: number;
  consultNumber: string;
  fileName: string;
  auditType: string;
  fileExt: string;
  upDate: string;
  totalFolios: number;
  observaciones: string;
  totalCorrect: number;
  totalIncorrect: number;
  report: boolean;
}
export type ListFluxes = {
  fluxStatus: string;
  upDate: string;
  fluxID: number;
  fluxMedia: string;
  fluxShortName: string;
  observations: string;
  companyName: string;
}
export type ListSpecials = {
  id: number;
  status: string;
  upDate: string;
  period: {
      start: string;
      end: string;
  },
  consultNumber: string;
  companyName: string;
  shortName: string;
  consultType: string;
  lastUpdate: string;
  eTag: string;
  fileRef: string;
  viewFile: boolean;
}
export type MultipartPayload = {
  numOtorgante: string
  tipoAuditoria: string
  esMasivo: string
  folioCDC: string
  nombre: string
}
export type SubTabsInfo<T> = {
  id: T;
  name: string;
  icon: JSX.Element;
}[]

export type MassiveUploadTabs = 'upload' | 'consult'
export type SpecialSubTabs = 'newRequest' | 'review' | 'periods'


export interface ContainerProps extends NameUser, ConsultNumber {
  toastFunc: any;
}
export interface HeaderProps {
  actualDate: Date;
  loadingData: boolean;
  dates: Periods;
  consultant: {
    periods: Periods[];
    type: string;
    numOtorgante: string;
    nameUser?: string;
    email: string;
    phone: string;
  }
}
type AdditionalBodyProps = PickOnly<HeaderProps, 'consultant' | 'dates' | 'loadingData'>
export interface BodyProps extends AdditionalBodyProps{
  actualTab: string;
  companyName: string;
}

export interface TypoProps {
  typo: string | ReactNode;
  classNames?: string;
  variant?: 'normal' | 'italic' | 'bold' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

type AdditionalSideBarProps = PickOnly<BodyProps, 'actualTab' | 'companyName'>
export interface SideBarProps extends NameUser, AdditionalSideBarProps {
  date: string;
  onChange: (value: string) => void
}

type AdditionalResultsProps = PickOnly<BodyProps, 'actualTab'>
export interface ResultsProps extends AdditionalResultsProps, TypeUser {}
export interface PieGraphProps extends TypeUser {
  allConsults: number;
  controlFigs: NormalObject[];
  onClickAnchor: (status: {name:string;value:number}) => void;
  required: number;
}

export interface DataTableProps {
  alertText?: string;
  columns: TableRow[];
  data: TableRow[];
  downloadReport?: () => void;
  expandableComponent?: ExpandableRowsComponent<any>;
  fixedHeight?: string;
  reloadTable?: () => void;
  subHeader?: boolean;
  tableRef?: RefObject<ElementRef<'div'>>;
  title?: string;
  totalRows: number;
}
export interface NoDataTableRecordsProps {
  reload: () => void;
  message: string;
  className?: string;
}
export interface SubHeaderTableProps {
  alertText?: string;
  cleanData: TableRow[];
  downloadReport?: () => void;
  expanded: boolean;
  filterValues: string[];
  handleReload?: () => void;
  placeholderNames: string[];
  setExpanded: (value: boolean) => void;
  setFilterData: (value: TableRow[]) => void
}

export interface ModalData {
  title: string;
  children: ReactNode;
  activeModal: {
    active: boolean;
    setActive: React.Dispatch<React.SetStateAction<boolean>>;
  };
  headerComponent?: JSX.Element;
  footerComponent?: JSX.Element;
  noHeader?: boolean;
  noFooter?: boolean;
  onAccept?: () => void;
}

export interface SubTabsProps<T>{
  subTabActual: T
  classNames?: string
  tabs: SubTabsInfo<T>
  setTab: React.Dispatch<React.SetStateAction<T>>
}

export interface PeriodsChangeProps extends ConsultNumber {
  actualPeriod: number;
  dates: Periods;
  periods:{ [key: string]: string};
  startPeriod: string;
  userID: number;
}

export interface S3UploadProps extends MultipartPayload {
  file:File
}
export interface InitMultipartParams extends MultipartPayload {
  partes: number;
}
export interface UploadChunks {
  url:string;
  chunk: Blob;
}
export interface CloseMultipartS3 {
  Bucket: string;
  UploadId: string;
  Key: string;
  Tags: {
    PartNumber: number;
    ETag: string;
  }[]
}
export interface AbortMultipartS3 extends PickOnly<CloseMultipartS3, 'Bucket' | 'UploadId' | 'Key'> {

}
export type QueryApiEndpoint<T> = ApiEndpointQuery<QueryDefinition<T, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, never, any>, any>

export enum ContentType {
  CSV_TYPE = 'application/csv',
  DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  JPEG_TYPE = 'image/jpeg',
  JPG_TYPE = 'image/jpg',
  PDF_TYPE = 'application/pdf',
  PNG_TYPE = 'image/png',
  PPTX_TYPE = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TIF_TYPE = 'image/tif',
  TIFF_TYPE = 'image/tiff',
  TXT_TYPE = 'text/plain',
  XLS_TYPE = 'application/vnd.ms-excel',
  XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export enum S3IDocumentGeneralType {
  S3 = 'S3',
  BASE_64 = 'BASE_64',
  FILE = 'FILE'
}

export type S3IDocument = {
  uri: IDocument['uri']
  fileName: string
  fileType: ContentType
  fileGeneralType: S3IDocumentGeneralType
  isAudio?: boolean
}

export type AxiosResponseError = {
  message: string
  code?: number
  title?: string
}

export type DocumentsViewerProps = {
  documents: S3IDocument[]
  error?: null | AxiosResponseError
  loading?: boolean
  handleDelete?: (filename: string) => void
}

export enum Palette {
  PRIMARY_COLOR = '#4463B3',
  BORDER_INPUT = '#CED4DA',
  BLUE_2_COLOR = '#E3E9F7',
  BLUE_200_COLOR = '#B5BED4',
  BLUE_400_COLOR = '#32487F',
  DARK_BLUE_1_COLOR = '#0B1A28',
  DARK_BLUE_2_COLOR = '#0B0B51',
  GREEN_500_COLOR = '#228B22',
  GREY_1_COLOR = '#CCC',
  GREY_2_COLOR = '#2B2525B3',
  GREY_4_COLOR = '#EDE6E6',
  GREY_5_COLOR = '#E9ECEF',
  GREY_300_COLOR = '#F4F3F399',
  GREY_500_COLOR = '#C1C1C1',
  GREY_700_COLOR = '#737373',
  DARK_GREY_1_COLOR = '#5E5A5A',
  RED_200_COLOR = '#FED7D7',
  RED_300_COLOR = '#FF0000',
  RED_500_COLOR = '#D80808',
  RED_600_COLOR = '#B10707',
  RED_800_COLOR = '#9B2C2C',
  YELLOW_500_COLOR = '#F1C40F',
  YELLOW_800_COLOR = '#3D2506',
  YELLOW_900_COLOR = '#1C1100',
  WHITE_COLOR = '#FFFFFF',
  BORDER_COLOR = '#80BDFF',
  AUDITED_COLOR = '#5D83EB',
  PENDING_COLOR = '#F25B83',
  ON_TIME_COLOR = '#B567E9',
  OVERDUE_COLOR = '#76AEFF',
  TOOLTIP_BG_COLOR = '#343333e6',
  BOOTSTRAP_1 = '#e2e3e5',
  BOOTSTRAP_2 = '#d6d8db',
  BOOTSTRAP_3 = '#e3e9f7',
  BOOTSTRAP_5 = '#575756',
  BOOTSTRAP_6 = '#383d41',
  TOASTY_COLOR_ERROR = '#e74c3c',
  DELIVERED_COLOR = '#407FC1',
  PENDING_AUDIT_COLOR = '#FF3333',
  REJECTED_COLOR = '#EE9E69',
}

export enum IconCtaVariant {
  DEFAULT_BLACK_24 = 'DEFAULT_BLACK_24',
  DEFAULT_GREEN_24 = 'DEFAULT_GREEN_24',
  DEFAULT_WHITE_24 = 'DEFAULT_WHITE_24',
  DEFAULT_BLACK_20 = 'DEFAULT_BLACK_20',
  DEFAULT_GREEN_20 = 'DEFAULT_GREEN_20',
  DEFAULT_WHITE_20 = 'DEFAULT_WHITE_20',
  DEFAULT_BLACK_16 = 'DEFAULT_BLACK_16',
  DEFAULT_GREEN_16 = 'DEFAULT_GREEN_16',
  DEFAULT_WHITE_16 = 'DEFAULT_WHITE_16',
  INPUT = 'INPUT',
  TABLE = 'TABLE',
  TABLE_ACTIONS = 'TABLE_ACTIONS',
}

export type HeroIconProps =
  Omit<React.SVGProps<SVGSVGElement>, "ref"> &
  {
    title?: string;
    titleId?: string;
  } &
  React.RefAttributes<SVGSVGElement>

export type HeroIcon = React.ForwardRefExoticComponent<HeroIconProps>

export interface HeroIconStyled extends HeroIconProps {
  Icon: HeroIcon
}

export type S3MultipartProps = (
  dispatch: ThunkDispatch<RootState, undefined, UnknownAction>,
  file: File,
  params: MultipartPayload,
  s3Actions: {
    init: QueryApiEndpoint<InitMultipartParams>
    upload: QueryApiEndpoint<UploadChunks>
    close: QueryApiEndpoint<CloseMultipartS3>
    abort: QueryApiEndpoint<AbortMultipartS3>
  },
  chunks: {chunkSize: number; totalParts: number[]},
) => Promise<void>