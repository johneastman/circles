// Vector Based on code found here: https://github.com/adiman9/pureJSCollisions
export class Vector {

    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    // Add two vectors together
    static add(first: Vector, second: Vector): Vector {
        return new Vector(first.x + second.x, first.y + second.y);
    }
    
    // Subtract two vectors
    static sub(first: Vector, second: Vector): Vector {
        return new Vector(first.x - second.x, first.y - second.y);
    }
    
    // Multiply a vector by a scalar value
    static mul(vector: Vector, scalar: number): Vector {
        return new Vector(vector.x * scalar, vector.y * scalar);
    }
    
    // Divide a vector by a scalar value
    static div(vector: Vector, scalar: number): Vector {
        return new Vector(vector.x / scalar, vector.y / scalar);
    }

    /*
    Given a line, return two Vectors offset on either side of a point on that line. 

    Calculate third point of right triangle with 2 points and a known distance:
    https://math.stackexchange.com/a/2126315
    */
    static perpendicularTo(lineStart: Vector, lineEnd: Vector, offsetDistance: number): Vector[] {
        let x1: number = lineStart.x;
        let x2: number = lineEnd.x;

        let y1: number = lineStart.y;
        let y2: number = lineEnd.y;

        let L: number = lineStart.distance(lineEnd);

        let xOffset: number = (offsetDistance * (y1 - y2)) / L;
        let yOffset: number = (offsetDistance * (x2 - x1)) / L;

        return [
            new Vector(x2 + xOffset, y2 + yOffset), // positive offset
            new Vector(x2 - xOffset, y2 - yOffset)  // negative offset
        ]
    }
    
    /*
    Given two vectors and a length, return a new vector 'length' units from 'first'. 'second' is used to
    calculate the slope of the line between 'first' and 'second'.
    
    Equations source: https://math.stackexchange.com/a/2045181
    */
    static distanceFrom(first: Vector, second: Vector, length: number): Vector {
        let distance: number = first.distance(second);
        let x: number = first.x + (length / distance) * (second.x - first.x);
        let y: number = first.y + (length / distance) * (second.y - first.y);
        return new Vector(x, y);
    }
    
    distance(other: Vector): number {
        return Math.sqrt((other.x - this.x) ** 2 + (other.y - this.y) ** 2)
    }

    // Returns the dot product of two vectors
    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }

    magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    
    // Tangent vector
    tan(): Vector {
        return new Vector(-this.y, this.x);
    }
    
    toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}
