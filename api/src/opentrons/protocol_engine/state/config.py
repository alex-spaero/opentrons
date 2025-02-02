"""Top-level ProtocolEngine configuration options."""
from dataclasses import dataclass

from opentrons_shared_data.robot.dev_types import RobotType


@dataclass(frozen=True)
class Config:
    """ProtocolEngine configuration options.

    Params:
        robot_type: What kind of robot the engine is controlling,
            or pretending to control.
        ignore_pause: The engine should no-op instead of waiting
            for pauses and delays to complete.
        use_virtual_modules: The engine should no-op instead of calling
            modules' hardware control API.
        use_virtual_gripper: The engine should no-op instead of calling
            gripper hardware control API.
        block_on_door_open: Protocol execution should pause if the
            front door is opened.
    """

    robot_type: RobotType
    ignore_pause: bool = False
    use_virtual_modules: bool = False
    use_virtual_gripper: bool = False
    block_on_door_open: bool = False
