import * as React from 'react'
import {
  Icon,
  JUSTIFY_SPACE_BETWEEN,
  IconProps,
  Flex,
  DIRECTION_ROW,
  ALIGN_CENTER,
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDERS,
  Btn,
  SIZE_1,
} from '@opentrons/components'

import type { StyleProps } from '@opentrons/components'

export type BannerType =
  | 'success'
  | 'warning'
  | 'error'
  | 'updating'
  | 'informing'

export interface BannerProps extends StyleProps {
  /** name constant of the icon to display */
  type: BannerType
  /** Banner contents */
  children?: React.ReactNode
  /** optional handler to show close button/clear alert  */
  onCloseClick?: (() => unknown) | React.MouseEventHandler<HTMLButtonElement>
  /** Override the default Alert Icon */
  icon?: IconProps
  /** some banner onCloseClicks fire events, this allows a spinner after click but before event finishes */
  isCloseActionLoading?: boolean
  /** Override the Exit icon */
  closeButton?: React.ReactNode
  /** Icon margin right for large banners */
  iconMarginRight?: string
  /** Icon margin left for large banners */
  iconMarginLeft?: string
}

const BANNER_PROPS_BY_TYPE: Record<
  BannerType,
  { icon: IconProps; backgroundColor: string; color: string }
> = {
  success: {
    icon: { name: 'check-circle' },
    backgroundColor: COLORS.successBackgroundLight,
    color: COLORS.successEnabled,
  },
  error: {
    icon: { name: 'alert-circle' },
    backgroundColor: COLORS.errorBackgroundLight,
    color: COLORS.errorEnabled,
  },
  warning: {
    icon: { name: 'alert-circle' },
    backgroundColor: COLORS.warningBackgroundLight,
    color: COLORS.warningEnabled,
  },
  updating: {
    icon: { name: 'ot-spinner' },
    backgroundColor: COLORS.darkGreyDisabled,
    color: COLORS.darkGreyEnabled,
  },
  informing: {
    icon: { name: 'information' },
    backgroundColor: COLORS.fundamentalsBackground,
    color: COLORS.darkGreyEnabled,
  },
}

export function Banner(props: BannerProps): JSX.Element {
  const {
    type,
    onCloseClick,
    icon,
    children,
    isCloseActionLoading,
    padding,
    closeButton,
    iconMarginLeft,
    iconMarginRight,
    size,
    ...styleProps
  } = props
  const bannerProps = BANNER_PROPS_BY_TYPE[type]

  const iconProps = {
    ...(icon ?? bannerProps.icon),
    size: size ?? SIZE_1,
    marginRight: iconMarginRight ?? SPACING.spacing3,
    marginLeft: iconMarginLeft ?? '0rem',
    color: BANNER_PROPS_BY_TYPE[type].color,
  }
  return (
    <Flex
      fontSize={TYPOGRAPHY.fontSizeP}
      fontWeight={TYPOGRAPHY.fontWeightRegular}
      borderRadius={SPACING.spacing2}
      backgroundColor={BANNER_PROPS_BY_TYPE[type].backgroundColor}
      border={`${SPACING.spacingXXS} ${BORDERS.styleSolid} ${BANNER_PROPS_BY_TYPE[type].color}`}
      flexDirection={DIRECTION_ROW}
      justifyContent={JUSTIFY_SPACE_BETWEEN}
      alignItems={ALIGN_CENTER}
      padding={padding ?? SPACING.spacing3}
      onClick={e => e.stopPropagation()}
      data-testid={`Banner_${type}`}
      {...styleProps}
    >
      <Icon
        {...iconProps}
        aria-label={`icon_${type}`}
        spin={BANNER_PROPS_BY_TYPE[type].icon.name === 'ot-spinner'}
      />
      <Flex flex="1" alignItems={ALIGN_CENTER}>
        {props.children}
      </Flex>
      {onCloseClick != null && !(isCloseActionLoading ?? false) ? (
        <Btn data-testid="Banner_close-button" onClick={props.onCloseClick}>
          {closeButton ?? (
            <Icon
              width={SPACING.spacing5}
              height={SPACING.spacing5}
              marginTop="0.375rem"
              name="close"
              aria-label="close_icon"
            />
          )}
        </Btn>
      ) : null}
      {(isCloseActionLoading ?? false) && (
        <Icon name="ot-spinner" size={SIZE_1} aria-label="ot-spinner" spin />
      )}
    </Flex>
  )
}
