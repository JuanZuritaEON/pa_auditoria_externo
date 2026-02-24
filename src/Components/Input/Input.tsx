import { isEmpty } from 'lodash'
import './Input.css'
import { getBrowser } from '../../Utils'

const Input = (props: any) => {
  const {
    id,
    aria,
    children,
    labelText,
    title,
    placeholder,
    onChange,
    onKeyDown,
    width,
    value,
    disabled = false,
    classNames = '',
    type = 'normalInput',
    options,
    innerRef,
    ...other
  } = props
  
  const isSelect = type === 'select'
  const handleChange = ({target}: any) => {
    if (onChange) onChange(target.value)
  }
  const actualBrowser = getBrowser()

  if (isSelect) return (
    <div className={`selectWrap ${classNames}`}>
      <select
        id={id}
        className={`
          ${labelText === 'Periodos' ? 'periodSelect' : ''}
          selectField${(actualBrowser === 'Chrome' || actualBrowser === 'Edge') ? '' : 'Normal'}
          paddingAdded`}
        disabled={disabled}
        title={title}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        autoComplete="off"
        value={value}
        required
        {...other}
      >
        {isEmpty(value) && <option title='' value=''>{placeholder}</option>}
        {options.map((option: {id:string;desc:string}, index: number) => (
          <option title={option.desc} key={index + 1} value={option.id}>{option.desc}</option>
        ))}
      </select>
      <label htmlFor={id} className='selectLabelCustom paddingAdded'>{labelText}</label>
    </div>
  )

  return (
    <div className={`wrap ${classNames}`}>
      <label className='inputLabel'>
        {labelText}
      </label>

      <div className='inputField' autoFocus>
        <input
          id={id}
          className={`fielded`}
          value={value}
          disabled={disabled}
          aria-describedby={aria ?? labelText}
          title={disabled ? title : undefined}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={onKeyDown}
          width={width}
          autoComplete="off"
          ref={innerRef}
          {...other}
        />
        {children}
      </div>
    </div>
  )
}

export default Input