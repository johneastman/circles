import { Circle } from "./sprites/circles";

export type GameEventType = "REMOVE_CIRCLE" | "REMOVE_BULLET";

export type GameEvent = {
    type: GameEventType;
    circle: Circle;
}
