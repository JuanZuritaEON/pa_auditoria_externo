import { memo, ReactNode } from 'react'
import Button from '../Button/Button'
import './SocialLinks.css'

const SocialLinks = (props: {
  socialsList: {
    text: string;
    style?: string;
    function: () => void;
    icon: string | ReactNode
  }[]
}) => {
  const { socialsList } = props
  return (
    <div className='pa_audit_socialsContainer'>
      {
        socialsList.map((social, index) => (
          <div key={`${social.text}_${index + 1}`} className={`pa_audit_iconsSocial ${social?.style}`}>
            {social.text && <span className='pa_audit_socials_tooltip'>{social.text}</span>}
            <Button type='button' variant='primary' classnames={`pa_audit_iconsSocial`} onClick={social.function}>
              {typeof social.icon === 'string' ? 
                <img src={social.icon} alt="social_icon" className='pa_audit_social_icon'/> :
                social.icon}
            </Button>
          </div>
        ))
      }
    </div>
  )
}

export default memo(SocialLinks)