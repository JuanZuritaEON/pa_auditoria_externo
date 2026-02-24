import { ReactNode } from 'react'
import './GlobalMessage.css'

const GlobalMessage = ({ children }: {children: ReactNode}) => (
  <div className='contentError'>
    {children}
  </div>
)

export default GlobalMessage