import * as React from 'react'
import { when, resetAllWhenMocks } from 'jest-when'
import { renderWithProviders } from '@opentrons/components'
import { i18n } from '../../../i18n'
import * as RobotApi from '../../../redux/robot-api'
import { ConfigurePipette } from '../../ConfigurePipette'
import { getAttachedPipetteSettingsFieldsById } from '../../../redux/pipettes'
import { mockPipetteSettingsFieldsMap } from '../../../redux/pipettes/__fixtures__'
import { getConfig } from '../../../redux/config'

import type { DispatchApiRequestType } from '../../../redux/robot-api'
import type { State } from '../../../redux/types'

jest.mock('../../../redux/robot-api')
jest.mock('../../../redux/config')
jest.mock('../../../redux/pipettes')

const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>
const mockUseDispatchApiRequest = RobotApi.useDispatchApiRequest as jest.MockedFunction<
  typeof RobotApi.useDispatchApiRequest
>
const mockGetRequestById = RobotApi.getRequestById as jest.MockedFunction<
  typeof RobotApi.getRequestById
>
const mockGetAttachedPipetteSettingsFieldsById = getAttachedPipetteSettingsFieldsById as jest.MockedFunction<
  typeof getAttachedPipetteSettingsFieldsById
>

const render = (props: React.ComponentProps<typeof ConfigurePipette>) => {
  return renderWithProviders(<ConfigurePipette {...props} />, {
    i18nInstance: i18n,
  })[0]
}

const mockRobotName = 'mockRobotName'

describe('ConfigurePipette', () => {
  let dispatchApiRequest: DispatchApiRequestType
  let props: React.ComponentProps<typeof ConfigurePipette>

  beforeEach(() => {
    props = {
      pipetteId: 'id',
      robotName: mockRobotName,
      updateRequest: { status: 'pending' },
      updateSettings: jest.fn(),
      closeModal: jest.fn(),
      formId: 'id',
    }
    when(mockGetRequestById)
      .calledWith({} as State, 'id')
      .mockReturnValue({
        status: RobotApi.SUCCESS,
        response: {
          method: 'POST',
          ok: true,
          path: '/',
          status: 200,
        },
      })
    mockGetConfig.mockReturnValue({} as any)
    when(mockGetAttachedPipetteSettingsFieldsById)
      .calledWith({} as State, mockRobotName, 'id')
      .mockReturnValue(mockPipetteSettingsFieldsMap)
    dispatchApiRequest = jest.fn()
    when(mockUseDispatchApiRequest)
      .calledWith()
      .mockReturnValue([dispatchApiRequest, ['id']])
  })
  afterEach(() => {
    jest.resetAllMocks()
    resetAllWhenMocks()
  })

  it('renders correct number of text boxes given the pipette settings data supplied by getAttachedPipetteSettingsFieldsById', () => {
    const { getAllByRole } = render(props)

    const inputs = getAllByRole('textbox')
    expect(inputs.length).toBe(9)
  })
})
