import { ExclamationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/16/solid'
import { AlertTypes, Icons } from './Alert.types'
import './Alert.css'

const Icon = (props: Icons) => {
  const { text, title, type, className, noIcon } = props
  const iconProps = { text, title, className }
  if (noIcon) return null
  switch (type) {
    case 'info': return <ExclamationCircleIcon {...iconProps} />
    case 'warning': return <ExclamationTriangleIcon {...iconProps} />
    case 'success': return <CheckCircleIcon {...iconProps} />
    default: return <XCircleIcon {...iconProps} />
  }
}

const Alert = (props: AlertTypes) => {
  const { text, customIcon, className = '', type = 'info', noIcon } = props
  const classes = `alertComponent alert_${type} ${className}`
  return (
    <div className={classes}>
      {customIcon ?? <Icon text={text} noIcon={noIcon} type={type} title={type} className={`iconStandardStyle alert_${type}`} />}
      {text}
    </div>
  )
}

export default Alert