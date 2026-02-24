import { HeroIconStyled, Palette } from '../../Redux'

type IconCtaVariant =
  'defaultBlack16' |
  'defaultBlack20' |
  'defaultBlack24' |
  'defaultGreen24' |
  'defaultWhite24' |
  'input' |
  'table' |
  'tableOutline' |
  'tableActions'

export type IconCtaCSSValues = {
  bgColor: Palette | 'unset'
  borderRadius: string
  color: Palette | 'unset'
  fill: Palette | 'transparent'
  hoverBgColor: Palette | 'transparent',
  hoverBorderRadius: string,
  hoverColor: Palette | 'unset',
  hoverFill: Palette | 'transparent'
  size: string
  padding: string
}

export type Config = Record<IconCtaVariant, IconCtaCSSValues>

export type IconCtaCSS = {
  variant: IconCtaVariant
  alignSelf?: string
}

export type IconCtaProps = IconCtaCSS & HeroIconStyled