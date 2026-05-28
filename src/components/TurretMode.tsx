import { TurretMode } from "../sprites/turret";
import "./TurretMode.css";

interface TurretModeProps {
    mode: string;
}

export function TurretModeComponent(props: TurretModeProps): JSX.Element {
    let turretMode: string = props.mode;

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
                        <ul className="turretMode">
                            <li>(5) Single</li>
                            <li>(6) Bounce</li>
                            <li>(7) Burst</li>
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
