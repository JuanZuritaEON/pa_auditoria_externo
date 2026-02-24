import es from 'date-fns/locale/es'
import { memo } from 'react'
import DatePicker, {
  ReactDatePickerProps,
  registerLocale
} from "react-datepicker"
import "./InputDate.css"
registerLocale("es", es)

const InputDate = ({
  dateFormat = "dd/MM/yy",
  maxDate = new Date(),
  ...props
}: ReactDatePickerProps) => (
  <DatePicker
    className='customInputDate'
    calendarClassName="customCard"
    locale="es"
    dateFormat={dateFormat}
    maxDate={maxDate}
    onKeyDown={(e) => e.preventDefault()}
    {...props}
  />
)

export default memo(InputDate)
