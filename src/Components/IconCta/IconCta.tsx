import styled, { css } from 'styled-components'
import { Palette } from '../../Redux'
import {
  Config,
  IconCtaCSS,
  IconCtaCSSValues,
  IconCtaProps,
} from './IconCta.types'

const {
  BLUE_2_COLOR,
  DARK_BLUE_1_COLOR,
  DARK_BLUE_2_COLOR,
  DARK_GREY_1_COLOR,
  GREEN_500_COLOR,
  PRIMARY_COLOR,
  WHITE_COLOR,
} = Palette

const DEFAULT_BLACK: Omit<IconCtaCSSValues, 'size'> = {
  bgColor: 'unset',
  borderRadius: 'unset',
  color: DARK_GREY_1_COLOR,
  fill: 'transparent',
  hoverBgColor: 'transparent',
  hoverBorderRadius: 'unset',
  hoverColor: DARK_BLUE_1_COLOR,
  hoverFill: 'transparent',
  padding: '0',
}

const CONFIG: Config = {
  input: {
    bgColor: 'unset',
    borderRadius: 'unset',
    color: DARK_BLUE_2_COLOR,
    fill: PRIMARY_COLOR,
    hoverBgColor: BLUE_2_COLOR,
    hoverBorderRadius: '50%',
    hoverColor: DARK_BLUE_2_COLOR,
    hoverFill: PRIMARY_COLOR,
    size: '24px',
    padding: '2px',
  },
  table: {
    bgColor: 'unset',
    borderRadius: 'unset',
    color: 'unset',
    fill: PRIMARY_COLOR,
    hoverBgColor: BLUE_2_COLOR,
    hoverBorderRadius: '50%',
    hoverColor: 'unset',
    hoverFill: DARK_BLUE_2_COLOR,
    size: '26px',
    padding: '4px',
  },
  tableOutline: {
    bgColor: 'unset',
    borderRadius: 'unset',
    color: PRIMARY_COLOR,
    fill: 'transparent',
    hoverBgColor: BLUE_2_COLOR,
    hoverBorderRadius: '50%',
    hoverColor: DARK_BLUE_2_COLOR,
    hoverFill: 'transparent',
    size: '26px',
    padding: '4px',
  },
  tableActions: {
    bgColor: 'unset',
    borderRadius: 'unset',
    color: DARK_BLUE_1_COLOR,
    fill: 'transparent',
    hoverBgColor: BLUE_2_COLOR,
    hoverBorderRadius: '50%',
    hoverColor: DARK_BLUE_1_COLOR,
    hoverFill: 'transparent',
    size: '32px',
    padding: '4px',
  },
  defaultBlack16: {
    ...DEFAULT_BLACK,
    size: '16px',
  },
  defaultBlack20: {
    ...DEFAULT_BLACK,
    size: '20px',
  },
  defaultBlack24: {
    ...DEFAULT_BLACK,
    size: '24px',
  },
  defaultGreen24: {
    bgColor: 'unset',
    borderRadius: 'unset',
    color: GREEN_500_COLOR,
    fill: 'transparent',
    hoverBgColor: 'transparent',
    hoverBorderRadius: 'unset',
    hoverColor: GREEN_500_COLOR,
    hoverFill: 'transparent',
    size: '24px',
    padding: '0',
  },
  defaultWhite24: {
    bgColor: 'unset',
    borderRadius: 'unset',
    color: WHITE_COLOR,
    fill: 'transparent',
    hoverBgColor: 'transparent',
    hoverColor: WHITE_COLOR,
    hoverBorderRadius: 'unset',
    hoverFill: 'transparent',
    size: '24px',
    padding: '0',
  },
}

const getStyles = ({
  alignSelf,
  variant,
}: IconCtaCSS) => {
  const {
    bgColor,
    borderRadius,
    color,
    fill,
    hoverBgColor,
    hoverBorderRadius,
    hoverColor,
    hoverFill,
    padding,
    size,
  } = CONFIG[variant]

  return css`
    align-self: ${alignSelf};
    background-color: ${bgColor};
    border-radius: ${borderRadius};
    color: ${color};
    fill: ${fill};
    min-width: ${size};
    max-width: ${size};
    min-height: ${size};
    max-height: ${size};
    padding: ${padding};

    &:hover {
      border-radius: ${hoverBorderRadius};
      background-color: ${hoverBgColor};
      color: ${hoverColor};
      cursor: pointer;
      fill: ${hoverFill};
    }
  `
}

export const IconCta = styled(({
  Icon,
  variant,
  ...props
}: IconCtaProps) =>
  <Icon {...props} />
) <IconCtaCSS>`${getStyles}`