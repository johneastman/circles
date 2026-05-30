import { Turret, TurretMode, BulletType } from "../sprites/turret";
import "./TurretMode.css";

interface TurretModeProps {
    turret: Turret;
}

export function TurretModeComponent(props: TurretModeProps): JSX.Element {
    const {
        turretMode,
        bulletType,
    }: { turretMode: string; bulletType: string } = props.turret;

    return (
        <table>
            <tbody>
                <tr>
                    <td className="turretModeTableLabel">
                        <strong>Turret Mode:</strong>
                    </td>
                    <td>
                        <ul
                            key="turretModes"
                            className="turretMode"
                            data-testid="turretModes"
                        >
                            {Array.from(TurretMode.KEYBOARD_TO_MODE).map(
                                (currentTurretMode, index) => {
                                    const keyboardKey: number = index + 1;
                                    return (
                                        <li
                                            key={keyboardKey}
                                            style={
                                                currentTurretMode === turretMode
                                                    ? { fontWeight: "bold" }
                                                    : {}
                                            }
                                        >{`(${keyboardKey}) ${currentTurretMode}`}</li>
                                    );
                                },
                            )}
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td className="turretModeTableLabel">
                        <strong>Bullet Type:</strong>
                    </td>
                    <td>
                        {/* TODO: implement bullet types */}
                        <ul
                            key="bulletTypes"
                            className="turretMode"
                            data-testid="bulletTypes"
                        >
                            {Array.from(BulletType.KEYBOARD_TO_TYPE).map(
                                (currentBulletType, index) => {
                                    const keyboardKey: number =
                                        index +
                                        TurretMode.KEYBOARD_TO_MODE.length +
                                        1;
                                    return (
                                        <li
                                            key={keyboardKey}
                                            style={
                                                currentBulletType === bulletType
                                                    ? { fontWeight: "bold" }
                                                    : {}
                                            }
                                        >{`(${keyboardKey}) ${currentBulletType}`}</li>
                                    );
                                },
                            )}
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
