import { BodyProps, RootState, SAVE_APP_FLUX, useAppDispatch, useAppSelector } from '../Redux'
import { Input, Loader, Modal, Results, SideBar, Socials, Typography } from '../Components'
import { assignPeriodDate, cleanPhoneData, sendAppError, sendToastMessage } from '../Utils'
import { survey, wa } from '../assets/images'
import { KeyboardEvent, useRef, useState } from 'react'
import { PencilSquareIcon } from '@heroicons/react/16/solid'

const BodyContainer = (props: BodyProps) => {
  const {
    actualTab,
    consultant: {type, nameUser, email, phone},
    companyName,
    dates,
    loadingData,
  } = props
  const {
    CDC_WAP_AUD,
    CDC_IFB_AUD,
    CDC_EKY_AUD
  } = useAppSelector((state: RootState) => state.app.appFluxContext.liferayUser.properties)
  const dispatch = useAppDispatch()
  const emailPattern = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
  const [openModal, setOpenModal] = useState(false)
  const [newEmail, setNewEmail] = useState(email)
  const [editEmail, setEditEmail] = useState({
    flag: false,
    validEmail: emailPattern.test(newEmail)
  })
  const [newPhone, setNewPhone] = useState(phone)
  const [editPhone, setEditPhone] = useState({
    flag: false,
    validPhone: newPhone.length === 10
  })
  const [sendingSurvey, setSendingSurvey] = useState(false)
  const handleChangeTab = (newTab: string) => dispatch(SAVE_APP_FLUX({ actualTab: newTab }))
  const handleWAredirect = () => {
    let href = CDC_WAP_AUD ?? ''
    const link = document.createElement('a')
    link.href = href
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(href)
  }
  const handleSendSurvey = async () => {
    try {
      setSendingSurvey(true)
      const payload = {
        participants: [
          {
            identifyBy: {
              identifier: `+52${newPhone}`,
              type:"PHONE"
            },
            variables: {
              nombre: nameUser,
              email: newEmail,
              numero: `+52${newPhone}`
            },
            person: {
              contactInformation: {
                email: [
                  {
                    "address": newEmail
                  }
                ]
              }
            }
          }
        ]
      }
      const callSurvey = await fetch(CDC_IFB_AUD ?? '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': CDC_EKY_AUD ?? ''
        },
        body: JSON.stringify(payload)
      }).then(res => res.json())
      sendToastMessage({
        type: 'info',
        message: 'Se ha enviado la encuesta a tus medios de contacto, gracias por participar.',
        closeTimer: 5000,
        position: 'bottom-right'
      })
      console.log({
        user: nameUser,
        //phone: payload.participants[0].identifyBy.identifier,
        ...callSurvey
      })
    } catch (error) {
      sendAppError(error)
    } finally { setSendingSurvey(false); setOpenModal(false) }
  }
  cleanPhoneData()
/*   const handleModal = () => {
    setNewPhone(phone)
    setNewEmail(email)
    setEditEmail({
      flag: false,
      validEmail: emailPattern.test(email)
    })
    setEditPhone({
      flag: false,
      validPhone: phone.length === 10
    })
    setOpenModal(!openModal)
  } */
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  if (loadingData) return <Loader width={180} height={180} wrapperClass='generalLoader' />
  return (
    <>
      <section className='containerBodyContent'>
        <SideBar
          actualTab={actualTab}
          companyName={companyName}
          date={assignPeriodDate({fechaInicio:dates.startDate, fechaFin:dates.endDate})}
          nameUser={nameUser as string}
          onChange={handleChangeTab}
        />
        <Results actualTab={actualTab} type={type} />
        <Socials socialsList={[
          {
            text: 'Contacta por Whatsapp',
            function: handleWAredirect,
            icon: wa,
            style: 'whatsapp_icon_style'
          },
          {
            text: 'Participa en la encuesta',
            function: () => setOpenModal(!openModal),
            icon: survey,
            style: 'survey_icon_style'
          },
        ]}/>
      </section>
      <Modal
        activeModal={{ active: openModal, setActive: setOpenModal }}
        title={'Verifica tus medios de contacto'}
        onAccept={editEmail.validEmail && editPhone.validPhone ? handleSendSurvey : undefined}
        noFooter={sendingSurvey}
      >
        {sendingSurvey ? <Loader wrapperClass='generalLoader'/> : <section className='surveyData'>
          <Typography typo={<>Usuario: <u>{nameUser}</u></>} variant='bold' />
          <Typography
            typo={`-- Verifica si tu información es correcta; de lo contrario, puedes modificarla. --`}
            size='sm'
            variant='italic'
          />
          <Input
            innerRef={emailRef}
            id="email"
            type='text'
            labelText={'Correo electrónico'}
            placeholder={newEmail}
            onChange={(newValue: any) => {
              setNewEmail(newValue)
              setEditEmail(prev => ({...prev, validEmail: emailPattern.test(newValue)}))
            }}
            disabled={!editEmail.flag}
            value={newEmail}
            required
            classNames='customInput'
          >
            {!editEmail.flag && <PencilSquareIcon
              onClick={() => {
                setTimeout(() => {
                  if (emailRef.current) emailRef.current.focus()
                }, 100)
                setEditEmail(prev => ({...prev, flag: true}))
              }}
              title={'Editar'}
              className='iconStandardStyle svgFill'
            />}
          </Input>
          {!editEmail.validEmail && <Typography typo='Correo no válido' size="sm" classNames='velvet' />}
          <Input
            innerRef={phoneRef}
            id="phone"
            type='tel'
            labelText={'Teléfono'}
            placeholder={newPhone}
            onChange={(newValue: any) => {
              setNewPhone(newValue)
              setEditPhone(prev => ({...prev, validPhone: newValue.length === 10}))
            }}
            value={newPhone}
            disabled={!editPhone.flag}
            required
            classNames='customInput'
            onKeyPress={(event: KeyboardEvent) => {
              if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
            maxLength={10}
          >
            {!editPhone.flag && <PencilSquareIcon
              onClick={() => {
                setTimeout(() => {
                  if (phoneRef.current) phoneRef.current.focus()
                }, 100)
                setEditPhone(prev => ({...prev, flag: true}))
              }}
              title={'Editar'}
              className='iconStandardStyle svgFill'
            />}
          </Input>
          {!editPhone.validPhone && <Typography typo='Teléfono no válido' size='sm' classNames='velvet' />}
        </section>}
      </Modal>
    </>
  )
}

export default BodyContainer