import { useEffect } from 'react'
import { useAppDispatch, useAppSelector, SAVE_ERRORS, Texts } from './Redux'
import { ToastContainer, toast } from 'react-toastify'
import { GlobalMessage } from './Components'
import { useLiferayData } from './Hooks'
import { Container } from './Containers'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const { loading, liferayUser } = useLiferayData()
  const { errors } = useAppSelector((state) => state.app)
  const dispatch = useAppDispatch()

  useEffect(() => {
    errors.forEach(({ active, code, message, url }) => {
      if (active) {
        const componentMessage = () => <GlobalMessage>
          {
            (url === 'cerrarMultipart' && code === 500) ? (
              <div dangerouslySetInnerHTML={{ __html: message }}>
              </div>
            ) : (
              <>
                <span>Error en servicio: "{url}"</span>
                <span>{Texts.ERROR_CODE}: "{code === 0 ? '000' : code}"</span>
                <span>- {message} -</span>
              </>
            )
          }
        </GlobalMessage>
        toast['error'](componentMessage, {
          position: "top-right",
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          theme: "colored",
          style: (url === 'cerrarMultipart' && code === 500) ? {
            background: "#f9d7da",
            color: "#923f46" 
          } : {},
          autoClose: (url === 'cerrarMultipart' && code === 500) ? false : 7500,
        })
      }
    })
    if (errors.length > 1) dispatch(SAVE_ERRORS([{
      url: '',
      code: '',
      message: '',
      active: false,
    }]))
  }, [errors, dispatch])

  if (loading) return <></>
  else return (
    <>
      <ToastContainer style={{
        width: 'fit-content',
        padding: '1.25rem',
        textAlign: 'justify',
        marginLeft: '0.5rem',
        lineHeight: '1.5'
      }} />
      <Container toastFunc={toast} nameUser={liferayUser.data.nameUser} numOtorgante={liferayUser.data.numOtorgante} />
    </>
  )
}

export default App