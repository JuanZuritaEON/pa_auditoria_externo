import styled from 'styled-components'

export type FileOptionCSS = {
  $isActive: boolean
}

const bgColor = ({
  $isActive,
}: FileOptionCSS) => (
  $isActive ?'#FFFFFF':'#E9ECEF'
)

const borderLeft = ({
  $isActive,
}: FileOptionCSS) => (
  $isActive ?
    `5px solid #4463B3` :
    'none'
)

const borderRadius = ({
  $isActive,
}: FileOptionCSS) => (
  $isActive ?
    '5px 0 0 5px' :
    '5px'
)

const boxShadow = ({
  $isActive,
}: FileOptionCSS) => (
  $isActive ?
    `-2px 0px 5px #ccc` :
    'none'
)

const margin = ({
  $isActive,
}: FileOptionCSS) => (
  $isActive ?
    '2px 0' :
    '2px 12px'
)

const right = ({
  $isActive,
}: FileOptionCSS) => (
  $isActive ?
    '-5px' :
    '0'
)

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 20%;
  max-width: 25%;
  margin: 2rem 0;
`

export const Header = styled.span`
  font-size: 1rem;
  color: #0B1A28;
  font-family: inherit;
  height: 46px;
  margin: 0 auto;
`

export const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
`

export const Item = styled.div<FileOptionCSS>`
  display: flex;
  flex-direction: column;
  background-color: ${bgColor};
  border-radius: ${borderRadius};
  padding: 12px 16px;
  font-size: 0.875rem;
  border-left: ${borderLeft};
  box-shadow: ${boxShadow};
  margin: ${margin};
  position: relative;
  right: ${right};
  width: 100%;

  &:hover {
    cursor: pointer;
  }
`

export const FileName = styled.span`
  font-size: 0.875rem;
  color: #0B1A28;
  font-family: inherit;
  text-overflow: ellipsis;
  white-space: normal;
  overflow: hidden;
`

export const FileDescription = styled.span`
  font-size: 0.7rem;
  color: #737373;
  font-family: inherit;
`

export const More = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  bottom: 0px;
  justify-content: center;
`