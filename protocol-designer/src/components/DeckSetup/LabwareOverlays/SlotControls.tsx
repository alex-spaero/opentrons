import assert from 'assert'
import * as React from 'react'
import { Icon, RobotCoordsForeignDiv } from '@opentrons/components'
import { DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd'
import cx from 'classnames'
import { connect } from 'react-redux'
import noop from 'lodash/noop'
import { i18n } from '../../../localization'
import { DND_TYPES } from '../../../constants'
import {
  getLabwareIsCompatible,
  getLabwareIsCustom,
} from '../../../utils/labwareModuleCompatibility'
import { BlockedSlot } from './BlockedSlot'
import {
  moveDeckItem,
  openAddLabwareModal,
} from '../../../labware-ingred/actions'
import {
  LabwareDefByDefURI,
  selectors as labwareDefSelectors,
} from '../../../labware-defs'
import { START_TERMINAL_ITEM_ID, TerminalItemId } from '../../../steplist'

import { BaseState, DeckSlot, ThunkDispatch } from '../../../types'
import { LabwareOnDeck } from '../../../step-forms'
import {
  DeckSlot as DeckSlotDefinition,
  ModuleType,
} from '@opentrons/shared-data'
import styles from './LabwareOverlays.css'

interface DNDP {
  isOver: boolean
  connectDropTarget: (val: React.ReactNode) => JSX.Element
  draggedItem: { labwareOnDeck: LabwareOnDeck } | null
  itemType: string
}

interface OP {
  slot: DeckSlotDefinition & { id: DeckSlot } // NOTE: Ian 2019-10-22 make slot `id` more restrictive when used in PD
  moduleType: ModuleType | null
  selectedTerminalItemId?: TerminalItemId | null
  handleDragHover?: () => unknown
}

interface DP {
  addLabware: (e: React.MouseEvent<any>) => unknown
  moveDeckItem: (item1: DeckSlot, item2: DeckSlot) => unknown
}

interface SP {
  customLabwareDefs: LabwareDefByDefURI
}

export type SlotControlsProps = OP & DP & DNDP & SP

export const SlotControlsComponent = (
  props: SlotControlsProps
): JSX.Element | null => {
  const {
    slot,
    addLabware,
    selectedTerminalItemId,
    isOver,
    connectDropTarget,
    moduleType,
    draggedItem,
    itemType,
    customLabwareDefs,
  } = props
  if (
    selectedTerminalItemId !== START_TERMINAL_ITEM_ID ||
    (itemType !== DND_TYPES.LABWARE && itemType !== null)
  )
    return null

  const draggedDef = draggedItem?.labwareOnDeck?.def
  const isCustomLabware = draggedItem
    ? getLabwareIsCustom(customLabwareDefs, draggedItem.labwareOnDeck)
    : false

  let slotBlocked: string | null = null
  if (
    isOver &&
    moduleType != null &&
    draggedDef != null &&
    !getLabwareIsCompatible(draggedDef, moduleType) &&
    !isCustomLabware
  ) {
    slotBlocked = 'Labware incompatible with this module'
  }

  return connectDropTarget(
    <g>
      {slotBlocked ? (
        <BlockedSlot
          x={slot.position[0]}
          y={slot.position[1]}
          width={slot.boundingBox.xDimension}
          height={slot.boundingBox.yDimension}
          message="MODULE_INCOMPATIBLE_SINGLE_LABWARE"
        />
      ) : (
        <RobotCoordsForeignDiv
          x={slot.position[0]}
          y={slot.position[1]}
          width={slot.boundingBox.xDimension}
          height={slot.boundingBox.yDimension}
          innerDivProps={{
            className: cx(styles.slot_overlay, styles.appear_on_mouseover, {
              [styles.appear]: isOver,
            }),
            onClick: isOver ? noop : addLabware,
          }}
        >
          <a className={styles.overlay_button} onClick={addLabware}>
            {!isOver && <Icon className={styles.overlay_icon} name="plus" />}
            {i18n.t(
              `deck.overlay.slot.${isOver ? 'place_here' : 'add_labware'}`
            )}
          </a>
        </RobotCoordsForeignDiv>
      )}
    </g>
  )
}

const mapStateToProps = (state: BaseState): SP => {
  return {
    customLabwareDefs: labwareDefSelectors.getCustomLabwareDefsByURI(state),
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<any>,
  ownProps: OP
): DP => ({
  addLabware: () => dispatch(openAddLabwareModal({ slot: ownProps.slot.id })),
  moveDeckItem: (sourceSlot, destSlot) =>
    dispatch(moveDeckItem(sourceSlot, destSlot)),
})

const slotTarget = {
  drop: (props: SlotControlsProps, monitor: DropTargetMonitor) => {
    const draggedItem = monitor.getItem()
    if (draggedItem) {
      props.moveDeckItem(draggedItem.labwareOnDeck.slot, props.slot.id)
    }
  },
  hover: (props: SlotControlsProps) => {
    if (props.handleDragHover) {
      props.handleDragHover()
    }
  },
  canDrop: (props: SlotControlsProps, monitor: DropTargetMonitor) => {
    const draggedItem = monitor.getItem()
    const draggedDef = draggedItem?.labwareOnDeck?.def
    const moduleType = props.moduleType
    assert(draggedDef, 'no labware def of dragged item, expected it on drop')

    if (moduleType != null && draggedDef != null) {
      // this is a module slot, prevent drop if the dragged labware is not compatible
      const isCustomLabware = getLabwareIsCustom(
        props.customLabwareDefs,
        draggedItem.labwareOnDeck
      )

      return getLabwareIsCompatible(draggedDef, moduleType) || isCustomLabware
    }
    return true
  },
}
const collectSlotTarget = (
  connect: DropTargetConnector,
  monitor: DropTargetMonitor
): React.ReactNode => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  draggedItem: monitor.getItem(),
  itemType: monitor.getItemType(),
})

export const SlotControls = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  DropTarget(
    DND_TYPES.LABWARE,
    slotTarget,
    collectSlotTarget
  )(SlotControlsComponent)
)
