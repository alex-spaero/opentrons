import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { SpinnerModalPage } from '@opentrons/components'

import * as RobotApi from '../../redux/robot-api'
import * as Sessions from '../../redux/sessions'
import { getPipetteOffsetCalibrationSession } from '../../redux/sessions/pipette-offset-calibration/selectors'
import { useFeatureFlag } from '../../redux/config'

import type { State } from '../../redux/types'
import type {
  SessionCommandString,
  PipetteOffsetCalibrationSession,
  PipetteOffsetCalibrationSessionParams,
} from '../../redux/sessions/types'
import type { RequestState } from '../../redux/robot-api/types'
import type { PipetteOffsetIntent } from '../../organisms/DeprecatedCalibrationPanels/types'

import { Portal } from '../../App/portal'
import { CalibratePipetteOffset } from '.'
import { INTENT_CALIBRATE_PIPETTE_OFFSET } from '../../organisms/DeprecatedCalibrationPanels'
import { pipetteOffsetCalibrationStarted } from '../../redux/analytics'
import { DeprecatedCalibratePipetteOffset } from '../DeprecatedCalibratePipetteOffset'

// pipette calibration commands for which the full page spinner should not appear
const spinnerCommandBlockList: SessionCommandString[] = [
  Sessions.sharedCalCommands.JOG,
]

const PIPETTE_OFFSET_TITLE = 'Pipette offset calibration'
const TIP_LENGTH_TITLE = 'Tip length calibration'
const EXIT = 'exit'

export interface InvokerProps {
  overrideParams?: Partial<PipetteOffsetCalibrationSessionParams>
  withIntent?: PipetteOffsetIntent
}

export type Invoker = (props: InvokerProps | undefined) => void

export function useCalibratePipetteOffset(
  robotName: string,
  sessionParams: Pick<PipetteOffsetCalibrationSessionParams, 'mount'> &
    Partial<Omit<PipetteOffsetCalibrationSessionParams, 'mount'>>,
  onComplete: (() => unknown) | null = null
): [Invoker, JSX.Element | null] {
  const createRequestId = React.useRef<string | null>(null)
  const deleteRequestId = React.useRef<string | null>(null)
  const jogRequestId = React.useRef<string | null>(null)
  const spinnerRequestId = React.useRef<string | null>(null)
  const dispatch = useDispatch()

  const enableCalibrationWizards = useFeatureFlag('enableCalibrationWizards')

  const pipOffsetCalSession: PipetteOffsetCalibrationSession | null = useSelector(
    (state: State) => {
      return getPipetteOffsetCalibrationSession(state, robotName)
    }
  )

  const [dispatchRequests] = RobotApi.useDispatchApiRequests(
    dispatchedAction => {
      if (
        dispatchedAction.type === Sessions.ENSURE_SESSION &&
        dispatchedAction.payload.sessionType ===
          Sessions.SESSION_TYPE_PIPETTE_OFFSET_CALIBRATION
      ) {
        // @ts-expect-error(sa, 2021-05-26): avoiding src code change, use in operator to type narrow
        createRequestId.current = dispatchedAction.meta.requestId
      } else if (
        dispatchedAction.type === Sessions.DELETE_SESSION &&
        pipOffsetCalSession?.id === dispatchedAction.payload.sessionId
      ) {
        // @ts-expect-error(sa, 2021-05-26): avoiding src code change, use in operator to type narrow
        deleteRequestId.current = dispatchedAction.meta.requestId
      } else if (
        dispatchedAction.type === Sessions.CREATE_SESSION_COMMAND &&
        dispatchedAction.payload.command.command ===
          Sessions.sharedCalCommands.JOG
      ) {
        // @ts-expect-error(sa, 2021-05-26): avoiding src code change, use in operator to type narrow
        jogRequestId.current = dispatchedAction.meta.requestId
      } else if (
        dispatchedAction.type !== Sessions.CREATE_SESSION_COMMAND ||
        !spinnerCommandBlockList.includes(
          dispatchedAction.payload.command.command
        )
      ) {
        // @ts-expect-error(sa, 2021-05-26): avoiding src code change, use in operator to type narrow
        spinnerRequestId.current = dispatchedAction.meta.requestId
      }
    }
  )

  const startingSession =
    useSelector<State, RequestState | null>(state =>
      createRequestId.current != null
        ? RobotApi.getRequestById(state, createRequestId.current)
        : null
    )?.status === RobotApi.PENDING

  const showSpinner =
    useSelector<State, RequestState | null>(state =>
      spinnerRequestId.current != null
        ? RobotApi.getRequestById(state, spinnerRequestId.current)
        : null
    )?.status === RobotApi.PENDING

  const shouldClose =
    useSelector<State, RequestState | null>(state =>
      deleteRequestId.current != null
        ? RobotApi.getRequestById(state, deleteRequestId.current)
        : null
    )?.status === RobotApi.SUCCESS

  const isJogging =
    useSelector((state: State) =>
      jogRequestId.current != null
        ? RobotApi.getRequestById(state, jogRequestId.current)
        : null
    )?.status === RobotApi.PENDING

  React.useEffect(() => {
    if (shouldClose) {
      onComplete?.()
      deleteRequestId.current = null
    }
  }, [shouldClose, onComplete])

  const [intent, setIntent] = React.useState<PipetteOffsetIntent>(
    INTENT_CALIBRATE_PIPETTE_OFFSET
  )

  const {
    mount,
    shouldRecalibrateTipLength = false,
    hasCalibrationBlock = false,
    tipRackDefinition = null,
  } = sessionParams
  const handleStartPipOffsetCalSession: Invoker = (props = {}) => {
    const {
      overrideParams = {},
      withIntent = INTENT_CALIBRATE_PIPETTE_OFFSET,
    } = props
    setIntent(withIntent)
    dispatchRequests(
      Sessions.ensureSession(
        robotName,
        Sessions.SESSION_TYPE_PIPETTE_OFFSET_CALIBRATION,
        {
          mount,
          shouldRecalibrateTipLength,
          hasCalibrationBlock,
          tipRackDefinition,
          ...overrideParams,
        }
      )
    )
    dispatch(
      pipetteOffsetCalibrationStarted(
        withIntent,
        mount,
        hasCalibrationBlock,
        shouldRecalibrateTipLength,
        tipRackDefinition != null
          ? `${tipRackDefinition.namespace}/${tipRackDefinition.parameters.loadName}/${tipRackDefinition.version}`
          : null
      )
    )
  }
  const isCorrectSession =
    pipOffsetCalSession != null &&
    mount === pipOffsetCalSession.createParams.mount &&
    tipRackDefinition === pipOffsetCalSession.createParams.tipRackDefinition

  let Wizard: JSX.Element | null = enableCalibrationWizards ? (
    <Portal level="top">
      {startingSession ? (
        <SpinnerModalPage
          titleBar={{
            title: PIPETTE_OFFSET_TITLE,
            back: {
              disabled: true,
              title: EXIT,
              children: EXIT,
            },
          }}
        />
      ) : (
        <CalibratePipetteOffset
          session={pipOffsetCalSession}
          robotName={robotName}
          showSpinner={startingSession || showSpinner}
          dispatchRequests={dispatchRequests}
          isJogging={isJogging}
        />
      )}
    </Portal>
  ) : (
    <Portal level="top">
      {startingSession ? (
        <SpinnerModalPage
          titleBar={{
            title:
              intent === INTENT_CALIBRATE_PIPETTE_OFFSET
                ? PIPETTE_OFFSET_TITLE
                : TIP_LENGTH_TITLE,
            back: {
              disabled: true,
              title: EXIT,
              children: EXIT,
            },
          }}
        />
      ) : (
        <DeprecatedCalibratePipetteOffset
          session={pipOffsetCalSession}
          robotName={robotName}
          showSpinner={startingSession || showSpinner}
          dispatchRequests={dispatchRequests}
          isJogging={isJogging}
          intent={intent}
        />
      )}
    </Portal>
  )

  if (!(startingSession || isCorrectSession)) Wizard = null

  return [handleStartPipOffsetCalSession, Wizard]
}
