import { SubTabsProps } from '../../Redux'
import { Button, Typography } from '..'
import './SubTabs.css'

const SubTabs = <T,> (props: SubTabsProps<T>) => {
  const { subTabActual, setTab, tabs, classNames = '' } = props
  return (
    <div className={`tabContent ${classNames}`}>
      {
        tabs.map((tab, index) => (
          <Button
            key={tab.name+index}
            type='button'
            classnames={`tabButton ${tab.id === subTabActual ?'tabButtonActive':''}`}
            onClick={() => setTab(tab.id)}
          >
            <Typography typo={tab.name}/>
            {tab.icon ?? tab.icon}
          </Button>
        ))
      }
    </div>
  )
}

export default SubTabs