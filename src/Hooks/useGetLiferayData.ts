import { useState, useEffect } from 'react'
import { SAVE_APP_FLUX, useAppDispatch } from '../Redux'

export const useLiferayData = () => {
  const [loading, setLoading] = useState(true)
  const [liferayUser, setLiferayUser] = useState<any>({
    data: {
      nameUser: null,
      numOtorgante: null,
      token: '',
      userId: 0
    },
    properties: {
      CDC_ID_AUD: '',
      CDC_SEC_AUD: '',
      CDC_URL_AUD: '',
      CDC_AWS_AUD: '',
      CDC_SPW_HDK: '',
      CDC_WAP_AUD: '',
      CDC_IFB_AUD: '',
      CDC_EKY_AUD: ''
    }
  })
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (window.Liferay) {
      const Liferay = window.Liferay
      const userId = Liferay.ThemeDisplay.getUserId()
      const properties = ['CDC_ID_AUD', 'CDC_SEC_AUD', 'CDC_URL_AUD', 'CDC_AWS_AUD', 'CDC_SPW_HDK', 'CDC_WAP_AUD', 'CDC_IFB_AUD', 'CDC_EKY_AUD']
      const initRequest = async () => {
        try {
          await Liferay.Service(
            [
              {
                '/properties.properties/get-init-user-properties': { userId },
              },
              {
                '/properties.properties/get-properties': { properties }
              },
            ],
            (obj: any) => {
              try {
                const data = {
                  nameUser: JSON.parse(obj[0]).nameUser,
                  numOtorgante: JSON.parse(obj[0]).numOtorgante,
                  token: JSON.parse(obj[0]).token,
                  userId: JSON.parse(obj[0]).userId,
                }
                setLiferayUser({
                  data,
                  properties: JSON.parse(obj[1]),
                })
                dispatch(SAVE_APP_FLUX({ liferayUser: {
                  data,
                  properties: JSON.parse(obj[1]),
                }}))
              } catch (error) {
                return error
              }
            }
          )
        } catch (error) {
          console.log(error)
        } finally {
          setLoading(false)
        }
      }
      initRequest()
    } else setLoading(false)
  }, [dispatch])

  return { loading, liferayUser }
}
