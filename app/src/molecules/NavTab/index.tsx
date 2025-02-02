import * as React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { BORDERS, COLORS, SPACING, TYPOGRAPHY } from '@opentrons/components'

interface NavTabProps {
  to: string
  tabName: string
  disabled?: boolean
}

const StyledNavLink = styled(NavLink)<React.ComponentProps<typeof NavLink>>`
  padding: 0 ${SPACING.spacing2} ${SPACING.spacing3};
  ${TYPOGRAPHY.labelSemiBold}
  color: ${COLORS.darkGreyEnabled};

  &.active {
    color: ${COLORS.darkBlackEnabled};
    ${BORDERS.tabBorder}
  }
`
const DisabledNavLink = styled.span`
  padding: 0 ${SPACING.spacing2} ${SPACING.spacing3};
  ${TYPOGRAPHY.labelSemiBold}
  color: ${COLORS.errorDisabled};
`

export function NavTab({
  to,
  tabName,
  disabled = false,
}: NavTabProps): JSX.Element {
  return (
    <StyledNavLink as={disabled ? DisabledNavLink : undefined} to={to} replace>
      {tabName}
    </StyledNavLink>
  )
}
