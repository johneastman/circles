import React from "react";
import "./App.css";
import {
    Circle,
    TargetCircle,
    Bullet,
    SplitterCircle,
} from "../sprites/circles";
import { Vector } from "../utils/vector";
import { BulletType, Turret, TurretMode } from "../sprites/turret";
import { getRandomColor, percentChance } from "../utils/util";
import { Color } from "../utils/color";
import Canvas from "./Canvas";
import { HighScores } from "./HighScores";
import { TurretModeComponent } from "./TurretMode";
import { Text } from "../sprites/text";
import { Menu } from "./Menu";
import { Sprite } from "../sprites/sprite";
import Dialog from "./Dialog";
import { clearValues } from "../utils/storage";
import { GameEvent } from "../events";

interface AppState {
    score: number;
    circles: Circle[];
    bullets: Bullet[];
    turret: Turret;
    isGameOver: boolean; // to avoid infinite loops
    sprites: Sprite[];
    isDialogOpen: boolean;
}

class App extends React.Component<{}, AppState> {
    canvasWidth: number;
    canvasHeight: number;
    numCircles: number;

    constructor(props: {}) {
        super(props);

        this.canvasWidth = 400;
        this.canvasHeight = 300;
        this.numCircles = 8;

        /**
         * Circles and bullets are in separate arrays to make checking the endgame state easier. This allows us
         * to simply check if the list of circles is empty, meaning the player has shot all the circles.
         * Otherwise, we'd have to loop through the array of combined circles and bullets and see if the list
         * no longer contains any circle instances.
         */
        this.state = {
            score: 0,
            circles: this.createCircles(),
            bullets: [],
            turret: new Turret(
                new Vector(this.canvasWidth / 2, this.canvasHeight),
            ),
            isGameOver: false,

            /**
             * A global variable for additional sprites to be drawn on the canvas (anything other than circles,
             * bullets, and the turret).
             */
            sprites: [],
            isDialogOpen: false,
        };
    }

    render(): JSX.Element {
        // Combine all sprites into one list to be drawn on the canvas
        let sprites: Sprite[] = (this.state.circles as Sprite[])
            .concat(this.state.bullets)
            .concat([this.state.turret])
            .concat(this.state.sprites);

        return (
            <div style={{ position: "relative" }}>
                <div
                    style={{
                        filter: this.state.isDialogOpen
                            ? "blur(0.20rem)"
                            : "none",
                    }}
                >
                    <Menu
                        score={this.state.score}
                        numCircles={this.state.circles.length}
                        resetGame={this.resetGameMouseEvent.bind(this)}
                        openDialog={() => {
                            this.setState({ isDialogOpen: true });
                        }}
                    />

                    <div
                        className="container" /* Position div right of center div: http://jsfiddle.net/1Lrph45y/4/ */
                    >
                        <div className="leftColumn"></div>

                        <div className="centerColumn">
                            <Canvas
                                width={this.canvasWidth}
                                height={this.canvasHeight}
                                sprites={sprites}
                                onClick={this.fireBullet.bind(this)}
                                onMouseMove={this.turretFollowMouse.bind(this)}
                            />
                            <TurretModeComponent turret={this.state.turret} />
                        </div>

                        <div className="rightColumn">
                            <HighScores
                                numTopScores={3}
                                currentScore={this.state.score}
                                isEndGame={this.isEndGame.bind(this)}
                            />
                        </div>
                    </div>
                </div>

                <Dialog
                    isOpen={this.state.isDialogOpen}
                    positiveActionText="Yes, delete my data"
                    positiveAction={this.clearData.bind(this)}
                    negativeActionText="No, keep my data"
                    negativeAction={() => {
                        this.setState({ isDialogOpen: false });
                    }}
                >
                    Are you sure you want to delete all your data? This will
                    include:
                    <br />
                    <ul>
                        <li>High Scores</li>
                        <li>Turret Mode</li>
                    </ul>
                    Once deleted, this data is gone forever and cannot be
                    recovered.
                </Dialog>

                {/*<Footer/>*/}
            </div>
        );
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyboardEvents.bind(this));

        this.mainLoop();
    }

    isEndGame(): boolean {
        return !this.state.isGameOver && this.state.circles.length === 0;
    }

    componentDidUpdate() {
        if (this.isEndGame()) {
            // Display end-game text in canvas
            let gameOverText: Text = new Text(
                "Game Over",
                this.canvasWidth / 2,
                this.canvasHeight / 2 - 10,
            );

            let scoreText: Text = new Text(
                `Score: ${this.state.score}`,
                this.canvasWidth / 2,
                this.canvasHeight / 2 + 33,
                undefined,
                35,
            );

            // Setting "isGameOVer" flag avoids infinite recursion with setting state and re-renders
            this.setState({
                isGameOver: true,
                sprites: [gameOverText, scoreText],
            });
        }
    }

    keyboardEvents(keyboardEvent: KeyboardEvent): void {
        keyboardEvent.stopImmediatePropagation();

        let turret: Turret = this.state.turret;
        const keyPressed: string = keyboardEvent.key.toLowerCase();

        // Reset Game
        if (keyPressed === "r") {
            this.resetGame();
        }

        TurretMode.KEYBOARD_TO_MODE.forEach((_, index) => {
            const keyboardKey: number = index + 1;
            if (keyPressed === keyboardKey.toString()) {
                turret.setTurretMode(TurretMode.KEYBOARD_TO_MODE[index]);
            }
        });

        BulletType.KEYBOARD_TO_TYPE.forEach((_, index) => {
            const keyboardKey: number =
                index + TurretMode.KEYBOARD_TO_MODE.length + 1;
            if (keyPressed === keyboardKey.toString()) {
                turret.setBulletType(BulletType.KEYBOARD_TO_TYPE[index]);
            }
        });

        this.setState({ turret: turret });
    }

    // Make the turret follow the player's mouse
    turretFollowMouse(
        e: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
    ): void {
        if (!this.state.isDialogOpen) {
            let rect: DOMRect = (
                e.target as HTMLCanvasElement
            ).getBoundingClientRect();
            let mouseVector: Vector = new Vector(
                e.clientX - rect.left,
                e.clientY - rect.top,
            );

            let turret: Turret = this.state.turret;
            turret.update(mouseVector);
            this.setState({ turret: turret });
        }
    }

    // Fire a bullet when the user clicks on the canvas
    fireBullet(_: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
        if (!this.state.isDialogOpen) {
            let turret: Turret = this.state.turret;
            let bullets: Bullet[] = turret.getBullets(
                this.canvasWidth,
                this.canvasHeight,
            );
            this.setState({ bullets: this.state.bullets.concat(bullets) });
        }
    }

    resetGameMouseEvent(
        _: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ): void {
        this.resetGame();
    }

    clearData(): void {
        // Set the turret mode back to default because the turret mode is stored in localStorage.
        let turret: Turret = this.state.turret;
        turret.setTurretMode(TurretMode.SINGLE);
        turret.setBulletType(BulletType.DEFAULT);

        // Clear data from localStorage
        clearValues();

        // Update turret and close dialog
        this.setState({ isDialogOpen: false, turret: turret });
    }

    resetGame(): void {
        this.setState({
            score: 0,
            circles: this.createCircles(),
            bullets: [],
            isGameOver: false,
            sprites: [],
        });
    }

    mainLoop() {
        if (!this.state.isDialogOpen) {
            let circles: Circle[] = this.state.circles.concat(
                this.state.bullets,
            );
            for (let i = 0; i < circles.length; i++) {
                const current: Circle = circles[i];

                /*
                Check collisions with the circles after the current circle in the array. Collisions with circles before the
                current circle in the array do not need to be checked due to the commutative property (e.g., if A collides
                with B, then B has, in a sense, collided with A).
                */
                const rest: Circle[] = circles.slice(i + 1);

                let gameEvents: GameEvent[] = [];

                for (let circle of rest) {
                    if (circle.collidedWith(current)) {
                        gameEvents = gameEvents.concat(
                            circle.collisionUpdate(current),
                        );
                    }
                }

                gameEvents = gameEvents.concat(current.checkEdges()); // Handle how circles respond at the edges of the canvas
                for (let { type, circle } of gameEvents) {
                    if (type === "ADD_CIRCLE") {
                        this.addCircle(circle);
                    } else if (type === "REMOVE_CIRCLE") {
                        this.removeCircle(circle);
                    } else if (type === "ADD_BULLET") {
                        this.addBullet(circle as Bullet);
                    } else if (type === "REMOVE_BULLET") {
                        this.removeBullet(circle as Bullet);
                    } else if (type === "UPDATE_SCORE") {
                        this.updateScore(circle as Bullet);
                    }
                }

                current.update();
            }
        }

        requestAnimationFrame(this.mainLoop.bind(this));
    }

    createCircles(): Circle[] {
        let circles: Circle[] = [];
        for (let i = 0; i < this.numCircles; i++) {
            let color: Color = getRandomColor();

            // 15 percent change the circle is a splitter circle
            let circle: Circle = percentChance(0.15)
                ? new SplitterCircle(this.canvasWidth, this.canvasHeight)
                : new TargetCircle(this.canvasWidth, this.canvasHeight, color);
            circles.push(circle);
        }
        return circles;
    }

    addCircle(newCircle: Circle): void {
        this.setState((prev) => ({ circles: prev.circles.concat(newCircle) }));
    }

    removeCircle(circle: Circle): void {
        // let circles: Circle[] = this.state.circles;

        // let index: number = circles.indexOf(circle);
        // circles.splice(index, 1);

        this.setState((prev) => ({
            circles: prev.circles.filter((c) => c !== circle),
        }));
    }

    removeBullet(bullet: Bullet): void {
        // let bullets: Bullet[] = this.state.bullets;

        // let index: number = bullets.indexOf(bullet);
        // bullets.splice(index, 1);

        this.setState((prev) => ({
            bullets: prev.bullets.filter((b) => b !== bullet),
        }));
    }

    addBullet(newBullet: Bullet): void {
        this.setState((prev) => ({ bullets: prev.bullets.concat(newBullet) }));
    }

    updateScore(bullet: Bullet): void {
        this.setState((prev) => ({
            score: prev.score + bullet.scoreMultiplier,
        }));
    }
}

export default App;
