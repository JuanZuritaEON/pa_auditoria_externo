import { ElementRef, RefObject } from "react"

export const DEFAULT_COLOR = '#4463B3'

export const DEFAULT_WAI_ARIA_ATTRIBUTE = {
  'aria-busy': true,
  role: 'status',
}

export type Style = {
  [key: string]: string
}

export interface BaseProps {
  height?: string | number
  width?: string | number
  color?: string
  ariaLabel?: string
  wrapperStyle?: Style
  wrapperClass?: string
  visible?: boolean
  tableRef?: RefObject<ElementRef<'div'>>
}