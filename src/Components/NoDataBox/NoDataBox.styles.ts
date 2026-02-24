import styled from 'styled-components'
import { Palette } from '../../Redux'

const {
  BOOTSTRAP_1,
  BOOTSTRAP_2,
  BOOTSTRAP_6,
} = Palette

export const Wrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 3rem;
  color: ${BOOTSTRAP_6};
  background-color: ${BOOTSTRAP_1};
  border-color: ${BOOTSTRAP_2};
`
