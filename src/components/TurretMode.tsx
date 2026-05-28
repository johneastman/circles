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
                                (mode, index) => {
                                    let keyboardKey: string = mode[0];
                                    let modeName: string = mode[1];
                                    return (
                                        <li
                                            key={index}
                                            style={
                                                keyboardKey === turretMode
                                                    ? { fontWeight: "bold" }
                                                    : {}
                                            }
                                        >{`(${keyboardKey}) ${modeName}`}</li>
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
                                (type, index) => {
                                    let keyboardKey: string = type[0];
                                    let typeName: string = type[1];
                                    return (
                                        <li
                                            key={index}
                                            style={
                                                keyboardKey === bulletType
                                                    ? { fontWeight: "bold" }
                                                    : {}
                                            }
                                        >{`(${keyboardKey}) ${typeName}`}</li>
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
