import React from 'react'
import styled from 'styled-components'
import { color, grayscale, shadow } from '../utils/colors'

import Link from './Link'

const Wrapper = styled(Link)`
  display: block;
  border-top: .333333333rem solid ${props => props.color};
  background-color: ${grayscale('white')};
  padding: 1rem 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: ${shadow(1)};
  text-decoration: none;
  color: inherit;
  font-weight: inherit;

  &:hover {
    box-shadow: ${shadow(2)};
    transform: translateY(-1px);
  }
`

const Title = styled.h3`
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
`

const Text = styled.p`
  margin: 0;
`

export default ({ title, children, color: c, ...props }) => (
  <Wrapper color={color(c)} {...props}>
    <Title>{title}</Title>
    <Text>{children}</Text>
  </Wrapper>
)