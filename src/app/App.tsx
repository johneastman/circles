import React from "react";

import "./App.css";
import { Circle, TargetCircle, Bullet } from "../circles/circles";
import { Vector } from "../circles/vector";
import { Turret } from "../circles/turret";
import { getRandomColor } from  "../circles/util";
import { Color } from "../circles/color";
import Canvas from '../canvas/Canvas';

interface AppState {
    score: number
    circles: Circle[]
    turret: Turret
}

class App extends React.Component<{}, AppState> {
    
    canvasWidth: number;
    canvasHeight: number;
    numCircles: number;
    canvasRef: React.RefObject<Canvas>;

    constructor(props: {}) {
        super(props);

        this.canvasWidth = 400;
        this.canvasHeight = 200;
        this.numCircles = 7;

        this.state = {
            score: 0,
            circles: this.createCircles(),
            turret: new Turret(this.canvasWidth, this.canvasHeight)
        };

        this.resetGame = this.resetGame.bind(this);
        this.turretFollowMouse = this.turretFollowMouse.bind(this);
        this.fireBullet = this.fireBullet.bind(this);
        this.mainLoop = this.mainLoop.bind(this);

        this.canvasRef = React.createRef();
    }

    // Make the turret follow the player's mouse
    turretFollowMouse(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
        let rect: DOMRect = this.canvasRef.current!.getBoundingClientRect();
        let mouseVector: Vector = new Vector(e.clientX - rect.left, e.clientY - rect.top);

        let turret: Turret = this.state.turret;
        turret.update(mouseVector);
        this.setState({turret: turret});
    }

    // Fire a bullet when the user clicks on the canvas
    fireBullet(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
        let startPos: Vector = new Vector(this.state.turret.turretStart.x, this.state.turret.turretStart.y);
        let endPos: Vector = new Vector(this.state.turret.turretEnd.x, this.state.turret.turretEnd.y);    
        let bullet = new Bullet(this, startPos, endPos);

        let circles: Circle[] = this.state.circles;
        circles.push(bullet);
        this.setState({circles: circles});
    }

    resetGame(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.setState({
            score: 0,
            circles: this.createCircles()
        });
    }

    componentDidMount() {
        this.mainLoop();
    }

    mainLoop() {
        let canvas: Canvas | null = this.canvasRef.current;
        if (canvas != null && canvas.state != null) {
            let context: CanvasRenderingContext2D = canvas.state.context;

            context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            for (let circle of this.state.circles) {
                circle.checkEdges();
        
                for (let c of this.state.circles) {
                    c.checkCollision(circle);
                }
        
                circle.update();
                circle.draw(context);
            }
            this.state.turret.draw(context);
        }
        requestAnimationFrame(this.mainLoop);
    }

    createCircles(): Circle[] {
        let circles: Circle[] = [];
        for (let i = 0; i < this.numCircles; i++) {
            let color: Color = getRandomColor();
            let circle = new TargetCircle(this, color);
            circles.push(circle);
        }
        return circles;
    }

    removeCircle(circle: Circle): void {
        let circles: Circle[] = this.state.circles;

        let index: number = circles.indexOf(circle);
        circles.splice(index, 1);

        this.setState({circles: circles});
    }

    updateScore(bullet: Bullet): void {
        this.setState({score: this.state.score + bullet.scoreMultiplier});
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <ul>
                    <li>Score: { this.state.score }</li>
                    <li><button onClick={this.resetGame}>Reset Game</button></li>
                </ul>
                <Canvas ref={this.canvasRef} width={this.canvasWidth} height={this.canvasHeight} onClick={this.fireBullet} onMouseMove={this.turretFollowMouse} />
            </div>
        );
    }
}

export default App;