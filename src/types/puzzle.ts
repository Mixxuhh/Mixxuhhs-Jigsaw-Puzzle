export interface PuzzlePiece {
  id: string;
  currentPosition: { x: number; y: number };
  correctPosition: { x: number; y: number };
  imageUrl: string;
  width: number;
  height: number;
  isPlaced: boolean;
}

export interface GameState {
  difficulty: "easy" | "medium" | "hard";
  pieces: PuzzlePiece[];
  isComplete: boolean;
  selectedImage: string;
  timer: number; // in seconds
  moves: number;
  isPlaying: boolean;
}

export interface DifficultySettings {
  easy: { rows: number; cols: number };
  medium: { rows: number; cols: number };
  hard: { rows: number; cols: number };
}
