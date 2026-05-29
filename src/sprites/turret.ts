import App from "../components/App";
import { Bullet, SplitterBullet } from "./circles";
import { Sprite } from "./sprite";
import { Vector } from "../utils/vector";
import { getValue, setValue } from "../utils/storage";

export class TurretMode {
    static SINGLE: string = "Single";
    static ARRAY: string = "Array";

    static KEYBOARD_TO_MODE: string[] = [
        this.SINGLE, this.ARRAY
    ];
}

export class BulletType {
    static DEFAULT: string = "Default";
    static BOUNCE: string = "Bounce";
    static BURST: string = "Burst";

    static KEYBOARD_TO_TYPE: string[] = [
        this.DEFAULT,
        this.BOUNCE,
        this.BURST
    ];
}

export class Turret implements Sprite {
    radius: number = 20;
    turretLength: number = 50;
    barrelStart: Vector;
    barrelEnd: Vector;

    turretMode: string;
    bulletType: string;
    turretModeKey: string;
    /*
    position: where to place the turret. This will be the (x, y) position for the base of the turret.
    */
    constructor(position: Vector) {        
        this.barrelStart = position;
        this.barrelEnd = new Vector(position.x, position.y - this.turretLength);
        this.turretModeKey = "turretMode";

        this.turretMode = this.getTurretMode();
        this.bulletType = this.getBulletType();
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
        if (this.turretMode === TurretMode.SINGLE) {
            if (this.bulletType === BulletType.DEFAULT) {
                return [new Bullet(app, this.barrelStart, this.barrelEnd)];
            } else if (this.bulletType === BulletType.BOUNCE) {
                return [new Bullet(app, this.barrelStart, this.barrelEnd, 0, 3)];
            } else if (this.bulletType === BulletType.BURST) {
                return [new SplitterBullet(app, this.barrelStart, this.barrelEnd)];
            }
        } else if (this.turretMode === TurretMode.ARRAY) {
            let perpendicularPoints: Vector[] = Vector.perpendicularTo(this.barrelStart, this.barrelEnd, 8);
            let left: Vector = perpendicularPoints[0];
            let right: Vector = perpendicularPoints[1];

            if (this.bulletType === BulletType.DEFAULT) {
                return [
                    new Bullet(app, this.barrelStart, this.barrelEnd),
                    new Bullet(app, this.barrelStart, left),
                    new Bullet(app, this.barrelStart, right)
                ];
            } else if (this.bulletType === BulletType.BOUNCE) {
                return [
                    new Bullet(app, this.barrelStart, this.barrelEnd, 0, 3),
                    new Bullet(app, this.barrelStart, left, 0, 3),
                    new Bullet(app, this.barrelStart, right, 0, 3)
                ];
            } else if (this.bulletType === BulletType.BURST) {
                return [
                    new SplitterBullet(app, this.barrelStart, this.barrelEnd),
                    new SplitterBullet(app, this.barrelStart, left),
                    new SplitterBullet(app, this.barrelStart, right)
                ];
            }
        }

        return [];
    }

    setTurretMode(mode: string): void {
        this.turretMode = mode;
        setValue(this.turretModeKey, mode);
    }

    getTurretMode(): string {
        return getValue(this.turretModeKey) || TurretMode.SINGLE;
    }

    getBulletType(): string {
        return getValue("bulletType") || BulletType.DEFAULT;
    }

    setBulletType(type: string): void {
        this.bulletType = type;
        setValue("bulletType", type);
    }
}
