import { Alert, Button, Typography } from '../..'
import { SAVE_APP_FLUX, Texts, useAppDispatch } from '../../../Redux'
import './UserAuth.css'
import '../Fluxes.css'

const UserAuth = (props: any) => {
  const {
    userName,
    companyName,
    numOtorgante,
    shortName,
    setAuth,
    setActiveModal,
    setAuditType
  } = props

  const dispatch = useAppDispatch()

  const handleAuth = () => {
    setAuth(false)
    dispatch(SAVE_APP_FLUX({ authCancel: true }))
  }
  const handleModal = () => {
    setActiveModal(true)
    setAuditType('8')
  }

  return (
    <section className='userAuthContainer'>
      <Alert text={Texts.FLUX_AUTH} type='warning' className='customAlertAuth' noIcon/>
      <Typography typo={<>Usuario: <u>{userName}</u></>} variant='italic' />
      <Typography typo={<>Otorgante: <u>{shortName} {numOtorgante} - {companyName}</u></>} variant='italic' />
      <Typography typo={<>
        Lo puede hacer dando clic en el siguiente botón:  
        <Button type='button' classnames='marginButton' variant='outline-primary' size='sm' onClick={handleModal}>Subir Formato</Button>
      </>}/>
      <Typography classNames='colorQuote' typo={'- Debe seleccionar "Tipo de Auditoria: Firma Autógrafa".'} variant='italic' size='sm' />
      <Typography classNames='colorQuote' typo={'- Adjunte su archivo y verifique en el visualizador.'} variant='italic' size='sm' />
      <Typography classNames='colorQuote' typo={'- Por último dar clic en enviar y esperar a que se envíe.'} variant='italic' size='sm' />
      <Typography typo={'En caso de querer hacerlo en otro momento o no utilizar formatos de firma autógrafa puedes dar clic en omitir.'}/>
      <Button type='button' variant='outline-primary' onClick={handleAuth}>Omitir Carga</Button>
    </section>
  )
}

export default UserAuth