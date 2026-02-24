import { memo } from 'react'
import { Wrapper } from './NoDataBox.styles'
import { NoDataBoxProps } from './NoDataBox.types'

const NoDataBox = ({
  className,
  text = 'Sin información'
}: NoDataBoxProps) => {
  return (
    <Wrapper className={className}>
      {text}
    </Wrapper>
  )
}

export default memo(NoDataBox)
