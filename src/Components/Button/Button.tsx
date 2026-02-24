import { ButtonTypes } from './Button.types'
import './Button.css'

const Button = (props: ButtonTypes) => {
  const { type = 'button', variant = 'primary', size = 'md', classnames = '', children, isLink = false, link, onClickAnchor, disabled } = props
  const classes = `generalButton button_${variant} size_${size} ${disabled ? 'disabled' : ''} ${classnames}`
  
  if (isLink) return <a href={link ?? undefined } onClick={onClickAnchor} target='_blank' rel='noreferrer' className={`linkedButton ${classnames}`}>{children}</a>
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button