import { Color } from "../utils/color";
import { Vector } from "../utils/vector";
import { sign, getCurrentTime, getRandomFloat, getRandomInteger, getRandomColor } from "../utils/util"
import App from "../components/App";
import { Sprite } from "./sprite";
import { GameEvent } from "../events";

export abstract class Circle implements Sprite {
    canvasWidth: number;
    canvasHeight: number;
    defaultColor: string;
    collisionColor: string;
    radius: number;
    mass: number;
    pos: Vector;
    vel: Vector;
    acc: Vector;
    collisionColorTimeActive: number;
    startTime: number;
    app: App;
    edgeCollisionCounter: number = 0;

    colorOffset: number = 40;

    constructor(
        app: App,
        x: number,
        y: number,
        radius: number,
        mass: number,
        color: Color,
        velocity?: Vector) {
        
        this.app = app;
        this.canvasWidth = app.canvasWidth;
        this.canvasHeight = app.canvasHeight;
        
        /*
        When objects collide, the color should change to a lighter version of the given color. The amount lighter is specified
        by 'colorOffset'.
        */
        this.defaultColor = color.rgbString();
        this.collisionColor = color.rgbString(this.colorOffset)
        
        this.radius = radius;
        this.mass = mass;
        
        this.pos = new Vector(x, y);

        // Velocity is an optional parameter
        this.vel = velocity || new Vector(sign() * (1 / radius) * 10, sign() * (1 / radius) * 10);
        
        this.acc = new Vector(0, 0);

        // After two objects collide, this determines how long the object's color is changed for
        this.collisionColorTimeActive = 0.15;
        
        // Subtracting the collision time ensures that the collision
        // color will not be active when the app starts.
        this.startTime = getCurrentTime() - this.collisionColorTimeActive;
    }

    /**
     * Check if two circle objects have collided. If the distance between the two circles' centers is less
     * than or equal to the sum of the radii, the circles have collided.
     * 
     * @param other another Circle instance
     * @returns boolean. True if the two circles have collided; false otherwise.
     */
    collidedWith(other: Circle): boolean {
        return this !== other && this.pos.distance(other.pos) <= this.radius + other.radius;
    }


    /**
     * Update circles' velocities after a collision has occurred ("collidedWith" checks if the circles have collided.)
     *  
     * Collision logic source: https://github.com/adiman9/pureJSCollisions/blob/master/index.js
     * Accompanying Tutorial: https://www.youtube.com/watch?v=XD-7anXSOp0
     * 
     * @param other another Circle object
     */
    collisionUpdate(other: Circle): void {
        this.startTime = getCurrentTime();
        other.startTime = getCurrentTime();

        const diffVec: Vector = Vector.sub(this.pos, other.pos);
        const distance: number = diffVec.magnitude();
        
        const unitNormal: Vector = Vector.div(diffVec, distance);
        const unitTan: Vector = unitNormal.tan();
        
        // Ensure that collided objects do not get stuck in each other.
        const correction: Vector = Vector.mul(unitNormal, this.radius + other.radius);
        this.pos = Vector.add(other.pos, correction);
        
        const thisNormal: number = this.vel.dot(unitNormal);
        const otherNormal: number = other.vel.dot(unitNormal);

        const thisTan: number = this.vel.dot(unitTan);
        const otherTan: number = other.vel.dot(unitTan);
        
        const thisScalarVelocity: number = (thisNormal * (this.mass - other.mass) + 
            2 * other.mass * otherNormal) / (this.mass + other.mass);
        
        const otherScalarVelocity: number = (otherNormal * (other.mass - this.mass) + 
            2 * this.mass * thisNormal) / (this.mass + other.mass);
        
        const thisFinalNormal: Vector = Vector.mul(unitNormal, thisScalarVelocity);
        const otherFinalNormal: Vector = Vector.mul(unitNormal, otherScalarVelocity);
        const thisFinalTan: Vector = Vector.mul(unitTan, thisTan);
        const otherFinalTan: Vector = Vector.mul(unitTan, otherTan);
        
        // Update velocities with final velocity.
        this.vel = Vector.add(thisFinalNormal, thisFinalTan);
        other.vel = Vector.add(otherFinalNormal, otherFinalTan);
    }

    /**
     * Check if circle is at the edge of the canvas and update the velocity so the circles moves in the
     * opposite direction.
     *  
     * Unlike with bullets--where we check if the bullet is beyond the bounds of the canvas so it appears
     * to fly off the canvas--we need to check if the circle is at the edge of the canvas so it appears
     * to bounces off the edge.
     */
    checkEdges(): GameEvent[] {

        if (this.isOutsideBounds()) {
            return [{type: "REMOVE_CIRCLE", circle: this}];
        }

        // Right side of canvas
        if (this.pos.x + this.radius >= this.canvasWidth) {
            this.startTime = getCurrentTime();
            this.pos.x = this.canvasWidth - this.radius;
            this.vel.x *= -1;
            this.edgeCollisionCounter += 1;
        }

        // Left side of canvas
        if (this.pos.x - this.radius <= 0) {
            this.startTime = getCurrentTime();
            this.pos.x = this.radius;
            this.vel.x *= -1;
            this.edgeCollisionCounter += 1;
        }

        // Bottom of canvas
        if (this.pos.y + this.radius >= this.canvasHeight) {
            this.startTime = getCurrentTime();
            this.pos.y = this.canvasHeight - this.radius;
            this.vel.y *= -1;
            this.edgeCollisionCounter += 1;
        }

        // Top of canvas
        if (this.pos.y - this.radius <= 0) {
            this.startTime = getCurrentTime();
            this.pos.y = this.radius;
            this.vel.y *= -1;
            this.edgeCollisionCounter += 1;
        }
        return [];
    }

    /**
     * Check if a {@link Circle} object is outside the bounds of the canvas.
     * 
     * @returns true if {@link Circle} is outside the bounds of the canvas; false otherwise.
     */
    isOutsideBounds(): boolean {

        if (Number.isNaN(this.pos.x) || Number.isNaN(this.pos.y)) {
            return true;
        }

        return this.pos.x + this.radius < 0 || this.pos.x - this.radius > this.canvasWidth ||
               this.pos.y + this.radius < 0 || this.pos.y - this.radius > this.canvasHeight
    }
    
    // Draw the circle on the canvas
    draw(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        context.lineWidth = 1;

        // Change the color for a few moments after a circle collides with a wall or another circle.
        if (getCurrentTime() - this.startTime >= this.collisionColorTimeActive) {
            context.fillStyle = this.defaultColor;
        } else {
            context.fillStyle = this.collisionColor;
        }

        context.closePath();
        context.fill();
        context.stroke();
    }
    
    // Update the position, velocity, and acceleration of the circle.
    update(): void {
        this.pos = Vector.add(this.pos, this.vel);
        this.vel = Vector.add(this.vel, this.acc);
        this.acc = Vector.mul(this.acc, 0);
    }
}

// Create a circle with random parameters.
export class TargetCircle extends Circle {

    constructor(app: App, color: Color, radius?: number, position?: Vector) {
        // Lower and upper bounds for circle sizes
        let radiusLowerBound: number = 10;
        let radiusUpperBound: number = 30;

        radius = radius || getRandomFloat(radiusLowerBound, radiusUpperBound);
        
        // Ensure that circle never leaves bounds of canvas.
        let x: number = position !== undefined ? position.x : getRandomFloat(radius, app.canvasWidth - radius);
        let y: number = position !== undefined ? position.y : getRandomFloat(radius, app.canvasHeight - radius);
        
        super(app, x, y, radius, radius, color);
    }
}

export class SplitterCircle extends Circle {

    constructor(app: App, position?: Vector) {
        let radius = 30;
        let color: Color = new Color(255, 130, 255);
        
        // Ensure that circle never leaves bounds of canvas.
        let x: number = position !== undefined ? position.x : getRandomFloat(radius, app.canvasWidth - radius);
        let y: number = position !== undefined ? position.y : getRandomFloat(radius, app.canvasHeight - radius);
        
        super(app, x, y, radius, radius, color);
    }
}

export class Bullet extends Circle {

    /*
    Every time a bullet hits a target, increment this value by 1, and increment the player's score
    by this value. This rewards the player for hitting multiple targets with the same bullet.
    */
    scoreMultiplier: number;
    bounceCounter: number;

    constructor(app: App, startPos: Vector, endPos: Vector, scoreMultiplier: number = 0, bounceCounter: number = 0) {
        /*
        Calculate the velocity of the bullet based on where the turret is pointing
        
        Projectile velocity source: https://gamedev.stackexchange.com/a/50983
        */
        let diffVec: Vector = Vector.sub(endPos, startPos);
        let length: number = diffVec.magnitude();
        let unit: Vector = Vector.div(diffVec, length);
        let speed: number = 3;
        let vel: Vector = Vector.mul(unit, speed);

        super(
            app,
            endPos.x,
            endPos.y,
            5,
            5,
            new Color(244, 229, 65),
            vel
        );
        
        this.scoreMultiplier = scoreMultiplier;
        this.bounceCounter = bounceCounter;
    }

    /**
     * Check if a bullet is off the bounds of the screen, and remove it from the list of bullets if it is. Note that
     * unlike circles--where we need to check if the circle is at the edge of the canvas so it appears to bounces
     * off the edge--we want to check if the bullet is beyond the bounds of the canvas so it appears to fly off the
     * screen.
     */
    checkEdges(): GameEvent[] {
        if (this.edgeCollisionCounter < this.bounceCounter) {
            super.checkEdges();
            return [];
        }

        if (this.isOutsideBounds()) {
            return [{type: "REMOVE_BULLET", circle: this}];
        }

        return [];
    }

    collisionUpdate(other: Circle): void {
        super.collisionUpdate(other); // Physics udates to bullet

        /**
         * Need to check if {@link other} is an instance of {@link SplitterCircle} first because {@link SplitterCircle}
         * inherits from {@link TargetCircle}. All {@link SplitterCircle} are instances of {@link TargetCircle},
         * but not all {@link TargetCircle} are instances of {@link SplitterCircle}.
         */
        if (other instanceof SplitterCircle) {
            this.app.removeCircle(other);

            /**
             * Right of circle:  bullet x > circle x
             * Left of circle:   bullet x < circle x
             * Top of circle:    bullet y < circle y
             * Bottom of circle: bullet y > circle y
             */
            let [min, max] = getOppositeAngleQuadrant(this, other);

            // Create two new circles in the quadrant
            let angles: number[] = [
                getRandomInteger(min, max),
                getRandomInteger(min, max)
            ];

            let newRadius: number = Math.floor(other.radius / 2);

            this.app.addCircles(angles.map(angle => {
                let newPosition: Vector = new Vector(
                    other.radius * Math.sin(Math.PI * 2 * angle / 360),
                    other.radius * Math.cos(Math.PI * 2 * angle / 360)
                );
                let position: Vector = Vector.add(newPosition, other.pos);
                let color: Color = getRandomColor();
                return new TargetCircle(this.app, color, newRadius, position);
            }));
        } else if (other instanceof TargetCircle) {
            this.scoreMultiplier += 1;
            this.app.updateScore(this);
            this.app.removeCircle(other);
        }
    }
}

export class SplitterBullet extends Bullet {

    collisionUpdate(other: Circle): void {

        if (other instanceof TargetCircle || other instanceof SplitterCircle) {
            this.app.removeBullet(this);
            this.app.removeCircle(other);

            this.scoreMultiplier += 1;
            this.app.updateScore(this);

            /*
            Create 4 new bullets equidistant from one another around the circumference of the circle (i.e., a "T" shape
            where each bullet is offset from the previous bullet by 90 degrees).

            The starting points are the right-, top-, left-, and bottom-most positions on the circle (0, 90, 180, and 270
            degrees, respectively). Then, an offset value between 0 and 90 is randomly generated and added to those
            initial values. The resulting angles are used to generate 4 points on the circle's circumference.

            Circle angles: https://i.stack.imgur.com/5zOW8.gif
            */
            let baseAngles: number[] = [0, 90, 180, 270];

            // Offset cannot exceed 90 because 270 + 90 == 360.
            let offset: number = getRandomInteger(0, 90);

            let angles: number[] = baseAngles.map(a => a + offset);
            this.app.addBullets(angles.map(angle => {
                let newPosition: Vector = new Vector(
                    other.radius * Math.sin(Math.PI * 2 * angle / 360),
                    other.radius * Math.cos(Math.PI * 2 * angle / 360)
                );
                return new Bullet(this.app, other.pos, Vector.add(newPosition, other.pos), this.scoreMultiplier);
            }));
        } else {
            super.collisionUpdate(other);
        }
    }
}

/**
 * Split the target circle into quadrants and determine in which quadrant the bullet
 * hit the circle. Then, return the range of angles in the opposite quadrant.
 * 
 * @param bullet bullet instance that hit circle
 * @param circle circle instance hit by bullet
 * @returns range of angles in quadrant opposite to the one the bullet hit 
 */
function getOppositeAngleQuadrant(bullet: Bullet, circle: Circle): number[] {
    let range: number[];
    if (bullet.pos.x > circle.pos.x && bullet.pos.y < circle.pos.y) {
        // angles 0 - 90 quadrant
        range = [181, 270];
    } else if (bullet.pos.x < circle.pos.x && bullet.pos.y < circle.pos.y) {
        // angles 91 - 180 quadrant
        range = [271, 359];
    } else if (bullet.pos.x < circle.pos.x && bullet.pos.y > circle.pos.y) {
        // angles 181 - 270 quadrant
        range = [0, 90];
    } else {
        // bullet.pos.x > circle.pos.x && bullet.pos.y > circle.pos.y
        // angles 271 - 359 quadrant
        range = [91, 180];
    }
    return range;
}