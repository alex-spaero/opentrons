export const SECTIONS = {
  BEFORE_BEGINNING: 'BEFORE_BEGINNING',
  ATTACH_PROBE: 'ATTACH_PROBE',
  DETACH_PROBE: 'DETACH_PROBE',
  RESULTS: 'RESULTS',
  MOUNT_PIPETTE: 'MOUNT_PIPETTE',
  DETACH_PIPETTE: 'DETACH_PIPETTE',
  MOUNTING_PLATE: 'MOUNTING_PLATE',
  CARRIAGE: 'CARRIAGE',
} as const

export const FLOWS = {
  ATTACH: 'ATTACH',
  DETACH: 'DETACH',
  CALIBRATE: 'CALIBRATE',
}
export const CALIBRATION_PROBE_DISPLAY_NAME = 'Calibration Probe'
export const HEX_SCREWDRIVER_DISPLAY_NAME = '2.5 mm Hex Screwdriver'
export const PIPETTE_DISPLAY_NAME = 'GEN3 Pipette'
export const NINETY_SIX_CHANNEL_DISPLAY_NAME = '96 Channel Pipette'
export const NINETY_SIX_CHANNEL_MOUNTING_PLATE_DISPLAY_NAME =
  '96 Channel Mounting Plate'

//  required equipment list
export const CALIBRATION_PROBE = {
  loadName: 'calibration_probe',
  displayName: CALIBRATION_PROBE_DISPLAY_NAME,
}
export const HEX_SCREWDRIVER = {
  loadName: 'hex_screwdriver',
  displayName: HEX_SCREWDRIVER_DISPLAY_NAME,
  subtitle:
    'Provided with robot. Using another size can strip the instruments’s screws.',
}
export const PIPETTE = {
  loadName: 'gen3_pipette',
  displayName: PIPETTE_DISPLAY_NAME,
}
export const NINETY_SIX_CHANNEL_PIPETTE = {
  loadName: 'pipette_96',
  displayName: NINETY_SIX_CHANNEL_DISPLAY_NAME,
}
export const NINETY_SIX_CHANNEL_MOUNTING_PLATE = {
  loadName: 'mounting_plate_96_channel',
  displayName: NINETY_SIX_CHANNEL_MOUNTING_PLATE_DISPLAY_NAME,
}
