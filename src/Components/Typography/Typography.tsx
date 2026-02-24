import { TypoProps } from '../../Redux'
import './Typography.css'

const Typography = ({
  typo,
  classNames = '',
  variant = 'normal',
  size = 'md',
}: TypoProps) => <span className={`${classNames} typoContent type_${variant} ${size}`}>{typo}</span>

export default Typography
