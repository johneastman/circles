import { Circle } from "./sprites/circles";

export type GameEventType = "ADD_CIRCLE" | "REMOVE_CIRCLE" | "ADD_BULLET" | "REMOVE_BULLET" | "UPDATE_SCORE";

export type GameEvent = {
    type: GameEventType;
    circle: Circle;
}
