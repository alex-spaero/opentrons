import { format, parseISO } from 'date-fns'
import type { PipetteOffsetCalibration } from '../../redux/calibration/api-types'
import type {
  FetchPipettesResponseBody,
  FetchPipettesResponsePipette,
  Mount,
} from '../../redux/pipettes/types'

/**
 * formats a string if it is in ISO 8601 date format
 * @param {string} timestamp ISO date string
 * @returns {string} formatted date string
 */
export function formatTimestamp(timestamp: string): string {
  // eslint-disable-next-line eqeqeq
  return (parseISO(timestamp) as Date | string) != 'Invalid Date'
    ? format(parseISO(timestamp), 'MM/dd/yyyy HH:mm:ss')
    : timestamp
}

export function downloadFile(data: object, fileName: string): void {
  // Create a blob with the data we want to download as a file
  const blob = new Blob([JSON.stringify(data)], { type: 'text/json' })
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })
  a.dispatchEvent(clickEvt)
  a.remove()
}

export function getIs96ChannelPipetteAttached(
  leftMountAttachedPipette: FetchPipettesResponsePipette | null
): boolean {
  const pipetteName = leftMountAttachedPipette?.name

  return pipetteName === 'p1000_96'
}

export function getOffsetCalibrationForMount(
  pipetteOffsetCalibrations: PipetteOffsetCalibration[] | null,
  attachedPipettes:
    | FetchPipettesResponseBody
    | { left: undefined; right: undefined },
  mount: Mount
): PipetteOffsetCalibration | null {
  if (pipetteOffsetCalibrations == null) {
    return null
  } else {
    return (
      pipetteOffsetCalibrations.find(
        cal =>
          cal.mount === mount && cal.pipette === attachedPipettes[mount]?.id
      ) || null
    )
  }
}
