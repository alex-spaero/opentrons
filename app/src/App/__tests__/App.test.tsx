import * as React from 'react'
import '@testing-library/jest-dom'
import { when, resetAllWhenMocks } from 'jest-when'

import { renderWithProviders } from '@opentrons/components'

import { i18n } from '../../i18n'
import { getIsOnDevice } from '../../redux/config'

import { DesktopApp } from '../DesktopApp'
import { OnDeviceDisplayApp } from '../OnDeviceDisplayApp'
import { App } from '../'

import type { State } from '../../redux/types'

jest.mock('../../redux/config')
jest.mock('../DesktopApp')
jest.mock('../OnDeviceDisplayApp')

const MOCK_STATE: State = {
  config: {
    isOnDevice: true,
  },
} as any

const mockDesktopApp = DesktopApp as jest.MockedFunction<typeof DesktopApp>
const mockOnDeviceDisplayApp = OnDeviceDisplayApp as jest.MockedFunction<
  typeof OnDeviceDisplayApp
>
const mockGetIsOnDevice = getIsOnDevice as jest.MockedFunction<
  typeof getIsOnDevice
>

const render = () => {
  return renderWithProviders(<App />, {
    i18nInstance: i18n,
    initialState: MOCK_STATE,
  })
}

describe('App', () => {
  beforeEach(() => {
    mockDesktopApp.mockReturnValue(<div>mock DesktopApp</div>)
    mockOnDeviceDisplayApp.mockReturnValue(<div>mock OnDeviceDisplayApp</div>)
    when(mockGetIsOnDevice).calledWith(MOCK_STATE).mockReturnValue(null)
  })
  afterEach(() => {
    jest.resetAllMocks()
    resetAllWhenMocks()
  })

  it('renders null before isOnDevice initializes', () => {
    const [{ container }] = render()
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a DesktopApp component when not on device', () => {
    when(mockGetIsOnDevice).calledWith(MOCK_STATE).mockReturnValue(false)
    const [{ getByText }] = render()
    getByText('mock DesktopApp')
  })

  it('renders an OnDeviceDisplayApp component when on device', () => {
    when(mockGetIsOnDevice).calledWith(MOCK_STATE).mockReturnValue(true)
    const [{ getByText }] = render()
    getByText('mock OnDeviceDisplayApp')
  })
})
