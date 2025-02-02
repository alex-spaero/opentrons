import * as React from 'react'
import { useSelector } from 'react-redux'
import { fetchPipettes, FETCH_PIPETTES } from '../../redux/pipettes'
import {
  getRequestById,
  useDispatchApiRequests,
  PENDING,
  SUCCESS,
  FAILURE,
} from '../../redux/robot-api'
import { PrimaryButton } from '../../atoms/buttons'

import type { RequestState } from '../../redux/robot-api/types'
import type { State } from '../../redux/types'

interface CheckPipetteButtonProps {
  robotName: string
  proceedButtonText: string
  setPending: React.Dispatch<React.SetStateAction<boolean>>
  proceed: () => void
  isDisabled: boolean
}
export const CheckPipetteButton = (
  props: CheckPipetteButtonProps
): JSX.Element => {
  const {
    robotName,
    proceedButtonText,
    setPending,
    proceed,
    isDisabled,
  } = props
  const fetchPipettesRequestId = React.useRef<string | null>(null)
  const [dispatch] = useDispatchApiRequests(dispatchedAction => {
    if (
      dispatchedAction.type === FETCH_PIPETTES &&
      'requestId' in dispatchedAction.meta &&
      dispatchedAction.meta.requestId
    ) {
      fetchPipettesRequestId.current = dispatchedAction.meta.requestId
    }
  })
  const handleCheckPipette = (): void =>
    dispatch(fetchPipettes(robotName, true))
  const requestStatus = useSelector<State, RequestState | null>(state =>
    fetchPipettesRequestId.current
      ? getRequestById(state, fetchPipettesRequestId.current)
      : null
  )?.status

  const isPending = requestStatus === PENDING

  React.useEffect(() => {
    if (isPending) {
      setPending(isPending)
    }
  }, [isPending, setPending])

  React.useEffect(() => {
    //  if requestStatus is FAILURE then the error modal will be in the results page
    if (requestStatus === SUCCESS || requestStatus === FAILURE) proceed()
  }, [proceed, requestStatus])

  return (
    <PrimaryButton disabled={isDisabled} onClick={handleCheckPipette}>
      {proceedButtonText}
    </PrimaryButton>
  )
}
