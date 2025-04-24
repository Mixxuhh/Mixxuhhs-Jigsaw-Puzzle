import { DifficultySettings } from "../types/puzzle";

export const DIFFICULTY_SETTINGS: DifficultySettings = {
  easy: { rows: 3, cols: 3 },
  medium: { rows: 4, cols: 4 },
  hard: { rows: 5, cols: 5 },
};

export const PUZZLE_IMAGES = [
  "/images/puzzle1.png",
  "/images/puzzle2.png",
  "/images/puzzle3.png",
];

export const GAME_CONTAINER_SIZE = 800; // pixels
export const PIECE_BORDER_RADIUS = 4; // pixels
