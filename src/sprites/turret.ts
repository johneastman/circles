import App from "../components/App";
import { Bullet, SplitterBullet } from "./circles";
import { Sprite } from "./sprite";
import { Vector } from "../utils/vector";
import { getValue, setValue } from "../utils/storage";

export class TurretMode {
    static DEFAULT: {key: string, displayName: string} = {key: "1", displayName: "Single"};
    static BOUNCE:  {key: string, displayName: string} = {key: "2", displayName: "Bounce"};
    static ARRAY:   {key: string, displayName: string} = {key: "3", displayName: "Array"};
    static BURST:   {key: string, displayName: string} = {key: "4", displayName: "Burst"};

    static KEYBOARD_TO_MODE: Map<string, string> = new Map([
        [this.DEFAULT.key, this.DEFAULT.displayName],
        [this.BOUNCE.key, this.BOUNCE.displayName],
        [this.ARRAY.key, this.ARRAY.displayName],
        [this.BURST.key, this.BURST.displayName],
    ]);
}

export class Turret implements Sprite {
    radius: number = 20;
    turretLength: number = 50;
    barrelStart: Vector;
    barrelEnd: Vector;

    turretMode: string;
    turretModeKey: string;
    /*
    position: where to place the turret. This will be the (x, y) position for the base of the turret.
    */
    constructor(position: Vector) {        
        this.barrelStart = position;
        this.barrelEnd = new Vector(position.x, position.y - this.turretLength);
        this.turretModeKey = "turretMode";

        this.turretMode = this.getTurretMode();
    }

    draw(context: CanvasRenderingContext2D): void {        
        // Turret barrel (the part that follows the mouse)
        context.beginPath();
        context.moveTo(this.barrelStart.x, this.barrelStart.y);
        context.lineTo(this.barrelEnd.x, this.barrelEnd.y);
        context.lineWidth = 5;
        context.closePath();
        context.stroke();

        // first two parameters to arc: (x, y) position of centerpoint for arc
        context.beginPath();
        context.arc(this.barrelStart.x, this.barrelStart.y, this.radius, 0, Math.PI, true);
        context.lineWidth = 1;
        context.fillStyle = "black";
        context.closePath();
        context.fill();
        context.stroke();
    }

    // Update where the turret barrel to always point toward the mouse
    update(mousePosVector: Vector): void {
        this.barrelEnd = Vector.distanceFrom(this.barrelStart, mousePosVector, this.turretLength)
    }

    getBullets(app: App): Bullet[] {
        let bullets: Bullet[];

        switch (this.turretMode) {
            case TurretMode.ARRAY.key:
                let perpendicularPoints: Vector[] = Vector.perpendicularTo(this.barrelStart, this.barrelEnd, 8);
                let left: Vector = perpendicularPoints[0];
                let right: Vector = perpendicularPoints[1];
    
                bullets = [
                    new Bullet(app, this.barrelStart, this.barrelEnd),
                    new Bullet(app, this.barrelStart, left),
                    new Bullet(app, this.barrelStart, right)
                ];
                break;
            case TurretMode.BURST.key:
                bullets = [new SplitterBullet(app, this.barrelStart, this.barrelEnd)];
                break;
            case TurretMode.BOUNCE.key:
                bullets = [new Bullet(app, this.barrelStart, this.barrelEnd, 0, 3)];
                break;
            default:
                // 
                bullets = [new Bullet(app, this.barrelStart, this.barrelEnd)];
                break;
        }
        return bullets;
    }

    setTurretMode(mode: string): void {
        this.turretMode = mode;
        setValue(this.turretModeKey, mode);
    }

    getTurretMode(): string {
        return getValue(this.turretModeKey) || TurretMode.DEFAULT.key;
    }
}
