import React from "react";

import "./App.css";
import { Circle, TargetCircle, Bullet } from "../sprites/circles";
import { Vector } from "../game/vector";
import { Turret } from "../sprites/turret";
import { getRandomColor } from  "../game/util";
import { Color } from "../game/color";
import Canvas from './Canvas';
import { HighScores } from "./HighScores";
import { Mode, TurretMode } from "./TurretMode";
import { Text } from "../sprites/text";

interface AppState {
    score: number;
    circles: Circle[];
    bullets: Bullet[];
    turret: Turret;
    isPaused: boolean; // for pausing/unpausing the game
    turretMode: {key: string, displayName: string};
}

class App extends React.Component<{}, AppState> {
    
    canvasWidth: number;
    canvasHeight: number;
    numCircles: number;
    canvasRef: React.RefObject<Canvas>;

    constructor(props: {}) {
        super(props);

        this.canvasWidth = 400;
        this.canvasHeight = 300;
        this.numCircles = 8;

        this.state = {
            score: 0,
            circles: this.createCircles(),
            bullets: [],
            turret: new Turret(
                new Vector(this.canvasWidth / 2, this.canvasHeight)
            ),
            isPaused: false,
            turretMode: Mode.DEFAULT
        };

        this.canvasRef = React.createRef();
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <div className="menu">
                    <ul>
                        <li>Score: { this.state.score }</li>
                        <li><button onClick={this.resetGameMouseEvent.bind(this)}>(R) { this.state.circles.length === 0 ? "Play Again" : "Reset Game" }</button></li>
                        <li>
                            <button
                                /*
                                The play/pause button needs to be disabled when the end-game state is reached because if
                                the user clicks play, the game will immediately unpause, but because there are no objects
                                in "this.state.circles", the game will immediately pause again and continually add the same
                                score to the high-score component.

                                If the player wants to play another round, they'll have to click "Reset Game".
                                */
                                disabled={this.state.circles.length === 0}
                                onClick={this.pauseGameMouseEvent.bind(this)}>(P) {this.state.isPaused ? "Play" : "Pause"}
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="gameWrapper" /* Position div right of center div: http://jsfiddle.net/1Lrph45y/4/ */ >
                    <div className="center">
                        <Canvas
                            ref={this.canvasRef}
                            width={this.canvasWidth}
                            height={this.canvasHeight}
                            onClick={this.fireBullet.bind(this)}
                            onMouseMove={this.turretFollowMouse.bind(this)}
                        />
                        <TurretMode mode={this.state.turretMode} />
                    </div>
                    <div className="scoreBoardFloating">
                        <div className="scoreBoard">
                            <HighScores 
                                numTopScores={3}
                                currentScore={this.state.score}
                                isEndGame={this.isEndGame.bind(this)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyboardEvents.bind(this));

        this.mainLoop();
    }

    isEndGame(): boolean {
        return !this.state.isPaused && this.state.circles.length === 0;
    }

    componentDidUpdate() {
        if (this.isEndGame()) {

            // Pause the game so the score is not continually added to the high-score board
            this.setState({isPaused: true});

            // Draw the game-over display on the canvas
            let canvas: Canvas = this.canvasRef.current!;
            canvas.clear();

            let gameOverText: Text = new Text(
                "Game Over",
                canvas.props.width / 2,
                (canvas.props.height / 2) - 10
            );
            canvas.draw(gameOverText);

            let scoreText: Text = new Text(
                `Score: ${this.state.score}`,
                canvas.props.width / 2,
                (canvas.props.height / 2) + 33,
                undefined,
                35
            );
            canvas.draw(scoreText);
        }
    }

    keyboardEvents(keyboardEvent: KeyboardEvent): void {
        keyboardEvent.stopImmediatePropagation();

        switch (keyboardEvent.key.toLowerCase()) {
            case "p":
                this.pauseGame();
                break;
            case "r":
                this.resetGame();
                break;
            case Mode.DEFAULT.key:
                this.setState({turretMode: Mode.DEFAULT});
                break;
            case Mode.BOUNCE.key:
                this.setState({turretMode: Mode.BOUNCE});
                break;
            case Mode.ARRAY.key:
                this.setState({turretMode: Mode.ARRAY});
                break;
            case Mode.BURST.key:
                this.setState({turretMode: Mode.BURST});
                break;
        }
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
    fireBullet(_: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
        let turret: Turret = this.state.turret;
        let bullets: Bullet[] = turret.getBullets(this, this.state.turretMode);
        this.setState({bullets: this.state.bullets.concat(bullets)});
    }

    resetGameMouseEvent(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.resetGame();
    }

    resetGame(): void {
        this.setState({
            score: 0,
            circles: this.createCircles(),
            bullets: [],
            isPaused: false
        });
    }

    pauseGameMouseEvent(_: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.pauseGame();
    }

    pauseGame(): void {
        this.setState({isPaused: !this.state.isPaused});
    }

    mainLoop() {
        if (!this.state.isPaused) {
            let canvas: Canvas | null = this.canvasRef.current;
            if (canvas != null && canvas.state != null) {
                canvas.clear();
    
                let circles: Circle[] = this.state.circles.concat(this.state.bullets);
                for (let i = 0; i < circles.length; i++) {
                    const current: Circle = circles[i];
    
                    /*
                    Check collisions with the circles after the current circle in the array. Collisions with circles before the
                    current circle in the array do not need to be checked due to the commutative property (e.g., if A collides
                    with B, then B has, in a sense, collided with A).
                    */
                    const rest: Circle[] = circles.slice(i + 1);
    
                    for (let circle of rest) {
                        if (circle.collidedWith(current)) {
                            circle.collisionUpdate(current);
                        } 
                    }
    
                    current.checkEdges(); // Handle how circles respond at the edges of the canvas
                    current.update();
                    canvas.draw(current);
                }
                canvas.draw(this.state.turret);
            }
        }

        requestAnimationFrame(this.mainLoop.bind(this));
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

    removeBullet(bullet: Bullet): void {
        let bullets: Bullet[] = this.state.bullets;

        let index: number = bullets.indexOf(bullet);
        bullets.splice(index, 1);

        this.setState({bullets: bullets});
    }

    addBullets(newBullets: Bullet[]): void {
        this.setState({bullets: this.state.bullets.concat(newBullets)});
    }

    updateScore(bullet: Bullet): void {
        this.setState({score: this.state.score + bullet.scoreMultiplier});
    }
}

export default App;