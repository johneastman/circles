import { render, screen } from "@testing-library/react";
import { TurretModeComponent } from "../../components/TurretMode";
import { Turret, TurretMode } from "../../sprites/turret";
import { Vector } from "../../utils/vector";

test("render turret mode", () => {
    render(<TurretModeComponent turret={new Turret(new Vector(0, 0))} />);
    const linkElement = screen.getByTestId("turretModes");
    expect(linkElement).toBeInTheDocument();
});
