 import { blue_arrow, grey_arrow } from '../../assets/images'
import { sideBarItems, SideBarProps } from '../../Redux'
import { getInitials } from '../../Utils'
import { Typography } from '..'
import './SideBar.css'

const Sidebar: React.FunctionComponent<SideBarProps> = (props) => {
  const { companyName, nameUser, date, actualTab, onChange } = props
  return (
    <aside className="sidebarContent">
      <div className="userDataInfo">
        <Typography typo={getInitials(nameUser)} size='sm'/>
        <Typography typo={<>Consultor: <b>{nameUser}</b></>} size='sm'/>
        <Typography typo={<>Razón social: <b>{companyName}</b></>} size='sm'/>
        <Typography typo={<>Fecha de consulta: <b>{date}</b></>} size='sm'/>
      </div>
      <ul>
        {
          sideBarItems.map((item, index) => (
            <li key={index + 1} className={`sideTab ${actualTab === item.id ? 'activeSideTab' : ''}`}>
              <button type='button' className='sideTabButton' onClick={() => onChange(item.id)}>
                <img src={item.src} width={40} height={40} alt="sideTab_icon"/>
                <Typography typo={item.id} />
                <img src={actualTab === item.id ? blue_arrow : grey_arrow } alt="arrow_interactive" />
              </button>
            </li>
          ))
        }
      </ul>
    </aside>
  )
}

export default Sidebar