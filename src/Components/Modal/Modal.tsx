import { modalComponentStyles, ModalData } from '../../Redux'
import ReactModal from 'react-modal'
import { isUndefined } from 'lodash'
import { Button } from '..'
import './Modal.css'

const modalSelector = document.getElementById('loadModal');
ReactModal.setAppElement(modalSelector);

const Modal = (props: ModalData) => {
  const {
    activeModal: { active, setActive },
    children,
    footerComponent,
    headerComponent,
    noFooter,
    noHeader,
    onAccept,
    title
  } = props

  const closeModal = () => setActive(false)

  return (
    <ReactModal
      isOpen={active}
      onRequestClose={closeModal}
      shouldCloseOnOverlayClick={false}
      style={{...modalComponentStyles}}
    >
      {isUndefined(headerComponent) && !noHeader ? (
        <header className='headerModal'>
          <span className='modalTitle'>{title}</span>
          <button type='button' className='modalCloseTab' onClick={closeModal}>
            <span>&times;</span>
          </button>
        </header>
        ) : headerComponent
      }
      <div className='bodyModal'>
        {children}  
      </div>
      {isUndefined(footerComponent) && !noFooter ? (
        <footer className='footerModal'>
          <Button
            variant='outline-primary'
            onClick={closeModal}
          >Cancelar</Button>
          <Button
            variant='primary'
            onClick={onAccept}
            disabled={isUndefined(onAccept)}
          >Enviar</Button>
        </footer>
        ) : footerComponent
      }
    </ReactModal>
  )
}

export default Modal;