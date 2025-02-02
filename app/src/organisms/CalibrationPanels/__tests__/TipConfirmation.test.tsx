import * as React from 'react'
import { renderWithProviders } from '@opentrons/components'
import { i18n } from '../../../i18n'
import { mockDeckCalTipRack } from '../../../redux/sessions/__fixtures__'
import * as Sessions from '../../../redux/sessions'

import { TipConfirmation } from '../TipConfirmation'

describe('TipConfirmation', () => {
  let render: (
    props?: Partial<React.ComponentProps<typeof TipConfirmation>>
  ) => ReturnType<typeof renderWithProviders>

  const mockSendCommands = jest.fn()
  const mockDeleteSession = jest.fn()

  beforeEach(() => {
    render = (props = {}) => {
      const {
        mount = 'left',
        isMulti = false,
        tipRack = mockDeckCalTipRack,
        sendCommands = mockSendCommands,
        cleanUpAndExit = mockDeleteSession,
        currentStep = Sessions.DECK_STEP_INSPECTING_TIP,
        sessionType = Sessions.SESSION_TYPE_DECK_CALIBRATION,
      } = props
      return renderWithProviders(
        <TipConfirmation
          isMulti={isMulti}
          mount={mount}
          tipRack={tipRack}
          sendCommands={sendCommands}
          cleanUpAndExit={cleanUpAndExit}
          currentStep={currentStep}
          sessionType={sessionType}
        />,
        { i18nInstance: i18n }
      )
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders correct heading', () => {
    const { getByRole } = render()[0]

    getByRole('heading', { name: 'Did pipette pick up tip successfully?' })
  })
  it('clicking invalidate tip send invalidate tip command', () => {
    const { getByRole } = render()[0]

    getByRole('button', { name: 'try again' }).click()
    expect(mockSendCommands).toHaveBeenCalledWith({
      command: Sessions.sharedCalCommands.INVALIDATE_TIP,
    })
  })
  it('proceeds to move to deck for pipette offset calibration', () => {
    const { getByRole } = render({
      sessionType: Sessions.SESSION_TYPE_PIPETTE_OFFSET_CALIBRATION,
    })[0]
    getByRole('button', { name: 'yes' }).click()
    expect(mockSendCommands).toHaveBeenCalledWith({
      command: Sessions.sharedCalCommands.MOVE_TO_DECK,
    })
  })
  it('proceeds to move to deck for deck calibration', () => {
    const { getByRole } = render({
      sessionType: Sessions.SESSION_TYPE_PIPETTE_OFFSET_CALIBRATION,
    })[0]
    getByRole('button', { name: 'yes' }).click()
    expect(mockSendCommands).toHaveBeenCalledWith({
      command: Sessions.sharedCalCommands.MOVE_TO_DECK,
    })
  })
  it('proceeds to move to reference point for tip length calibration', () => {
    const { getByRole } = render({
      sessionType: Sessions.SESSION_TYPE_TIP_LENGTH_CALIBRATION,
    })[0]
    getByRole('button', { name: 'yes' }).click()
    expect(mockSendCommands).toHaveBeenCalledWith({
      command: Sessions.sharedCalCommands.MOVE_TO_REFERENCE_POINT,
    })
  })
  it('proceeds to move to reference point for calibration health check', () => {
    const { getByRole } = render({
      sessionType: Sessions.SESSION_TYPE_CALIBRATION_HEALTH_CHECK,
    })[0]
    getByRole('button', { name: 'yes' }).click()
    expect(mockSendCommands).toHaveBeenCalledWith({
      command: Sessions.sharedCalCommands.MOVE_TO_REFERENCE_POINT,
    })
  })
})
