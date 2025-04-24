import React, { useState, useEffect, useRef } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  useDndMonitor,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import { PuzzlePiece, GameState } from "../types/puzzle";
import {
  DIFFICULTY_SETTINGS,
  GAME_CONTAINER_SIZE,
} from "../constants/gameSettings";
import PuzzlePieceComponent from "./PuzzlePiece";
import "../styles/PuzzleGame.css";

interface PuzzleGameProps {
  difficulty: GameState["difficulty"];
  selectedImage: string;
}

const GridCell: React.FC<{
  row: number;
  col: number;
  pieceWidth: number;
  pieceHeight: number;
}> = ({ row, col, pieceWidth, pieceHeight }) => {
  const { setNodeRef } = useDroppable({
    id: `cell-${row}-${col}`,
    data: {
      row,
      col,
      x: col * pieceWidth,
      y: row * pieceHeight,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="puzzle-grid-cell"
      style={{
        width: pieceWidth,
        height: pieceHeight,
        left: col * pieceWidth,
        top: row * pieceHeight,
      }}
    />
  );
};

const PuzzleGame: React.FC<PuzzleGameProps> = ({
  difficulty,
  selectedImage,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    difficulty,
    pieces: [],
    isComplete: false,
    selectedImage,
    timer: 0,
    moves: 0,
    isPlaying: false,
  });

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameState.isComplete && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [gameState.isComplete]);

  const preloadImage = (imageUrl: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  const initializePuzzle = async (
    difficulty: GameState["difficulty"],
    imageUrl: string
  ) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await preloadImage(imageUrl);

      const { rows, cols } = DIFFICULTY_SETTINGS[difficulty];
      const pieceWidth = GAME_CONTAINER_SIZE / cols;
      const pieceHeight = GAME_CONTAINER_SIZE / rows;

      const pieces: PuzzlePiece[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const id = `${row}-${col}`;
          const correctPosition = {
            x: col * pieceWidth,
            y: row * pieceHeight,
          };
          pieces.push({
            id,
            currentPosition: {
              x: -1,
              y: -1,
            },
            correctPosition,
            imageUrl,
            width: pieceWidth,
            height: pieceHeight,
            isPlaced: false,
          });
        }
      }

      const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);

      setGameState((prev) => ({
        ...prev,
        pieces: shuffledPieces,
        difficulty,
        selectedImage: imageUrl,
        isComplete: false,
        timer: 0,
        moves: 0,
        isPlaying: true,
      }));

      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        if (!gameState.isComplete) {
          const elapsedSeconds = Math.floor(
            (Date.now() - startTimeRef.current!) / 1000
          );
          setGameState((prev) => ({
            ...prev,
            timer: elapsedSeconds,
          }));
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  };

  useEffect(() => {
    initializePuzzle(difficulty, selectedImage);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [difficulty, selectedImage]);

  const handleDragStart = (event: DragStartEvent) => {
    const pieceId = event.active.id as string;
    setGameState((prev) => ({
      ...prev,
      pieces: prev.pieces.map((piece) =>
        piece.id === pieceId ? { ...piece, isDragging: true } : piece
      ),
    }));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const pieceId = active.id as string;
    const activePiece = gameState.pieces.find((p) => p.id === pieceId);
    if (!activePiece) return;

    const dropZoneRect = over.rect;
    const gridX = Math.floor(dropZoneRect.left / activePiece.width);
    const gridY = Math.floor(dropZoneRect.top / activePiece.height);

    // Check if the piece is near its correct grid position
    const isNearCorrectPosition =
      gridX === Math.floor(activePiece.correctPosition.x / activePiece.width) &&
      gridY === Math.floor(activePiece.correctPosition.y / activePiece.height);

    if (isNearCorrectPosition) {
      setGameState((prev) => ({
        ...prev,
        pieces: prev.pieces.map((piece) =>
          piece.id === pieceId
            ? {
                ...piece,
                currentPosition: piece.correctPosition,
                isPlaced: true,
                isDragging: true,
              }
            : piece
        ),
      }));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const pieceId = active.id as string;

    setGameState((prev) => {
      const activePiece = prev.pieces.find((p) => p.id === pieceId)!;

      if (!over) {
        return {
          ...prev,
          pieces: prev.pieces.map((piece) =>
            piece.id === pieceId
              ? {
                  ...piece,
                  isDragging: false,
                  currentPosition: { x: -1, y: -1 },
                }
              : piece
          ),
        };
      }

      const dropData = over.data.current as { x: number; y: number };
      const newX = dropData.x;
      const newY = dropData.y;

      // Find if there's a piece at the target position
      const targetPiece = prev.pieces.find(
        (piece) =>
          piece.isPlaced &&
          piece.currentPosition.x === newX &&
          piece.currentPosition.y === newY
      );

      // If there's already a piece at the target position and it's not the same piece
      if (targetPiece && targetPiece.id !== pieceId) {
        // Return the piece to its original position if it was placed
        if (activePiece.isPlaced) {
          return {
            ...prev,
            pieces: prev.pieces.map((piece) =>
              piece.id === pieceId
                ? {
                    ...piece,
                    isDragging: false,
                    currentPosition: piece.currentPosition,
                  }
                : piece
            ),
          };
        }
        // Return unplaced piece to the pieces container
        return {
          ...prev,
          pieces: prev.pieces.map((piece) =>
            piece.id === pieceId
              ? {
                  ...piece,
                  isDragging: false,
                  currentPosition: { x: -1, y: -1 },
                }
              : piece
          ),
        };
      }

      // If the target position is empty or it's the same piece, allow the move
      const updatedPieces = prev.pieces.map((piece) => {
        if (piece.id === pieceId) {
          return {
            ...activePiece,
            currentPosition: { x: newX, y: newY },
            isPlaced: true,
            isDragging: false,
          };
        }
        return piece;
      });

      const isComplete = checkCompletion(updatedPieces);

      // If the puzzle is complete, stop the timer
      if (isComplete && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      return {
        ...prev,
        pieces: updatedPieces,
        moves: prev.moves + 1,
        isComplete,
        isPlaying: !isComplete,
      };
    });
  };

  useDndMonitor({
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
  });

  const checkCompletion = (pieces: PuzzlePiece[]): boolean => {
    return pieces.every(
      (piece) =>
        piece.isPlaced &&
        Math.abs(piece.currentPosition.x - piece.correctPosition.x) < 5 &&
        Math.abs(piece.currentPosition.y - piece.correctPosition.y) < 5
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const unplacedPieces = gameState.pieces.filter((p) => !p.isPlaced);
  const placedPieces = gameState.pieces.filter((p) => p.isPlaced);

  return (
    <div className="puzzle-game-wrapper">
      <div className="puzzle-game-stats">
        <div className="puzzle-stat-item">
          <div className="puzzle-stat-label">Time</div>
          <div className="puzzle-stat-value">{formatTime(gameState.timer)}</div>
        </div>
        <div className="puzzle-stat-item">
          <div className="puzzle-stat-label">Moves</div>
          <div className="puzzle-stat-value">{gameState.moves}</div>
        </div>
        <div className="puzzle-stat-item">
          <div className="puzzle-stat-label">Pieces Placed</div>
          <div className="puzzle-stat-value">
            {placedPieces.length}/{gameState.pieces.length}
          </div>
        </div>
      </div>
      <div className="puzzle-game-layout">
        <div className="puzzle-game-board">
          {Array.from({ length: DIFFICULTY_SETTINGS[difficulty].rows }).map(
            (_, row) =>
              Array.from({ length: DIFFICULTY_SETTINGS[difficulty].cols }).map(
                (_, col) => (
                  <GridCell
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    pieceWidth={
                      GAME_CONTAINER_SIZE / DIFFICULTY_SETTINGS[difficulty].cols
                    }
                    pieceHeight={
                      GAME_CONTAINER_SIZE / DIFFICULTY_SETTINGS[difficulty].rows
                    }
                  />
                )
              )
          )}
          {placedPieces.map((piece) => (
            <PuzzlePieceComponent
              key={piece.id}
              piece={piece}
              isPlaced={true}
            />
          ))}
        </div>
      </div>
      <div className="puzzle-pieces-container" data-difficulty={difficulty}>
        {unplacedPieces.map((piece) => (
          <PuzzlePieceComponent key={piece.id} piece={piece} isPlaced={false} />
        ))}
      </div>
      {gameState.isComplete && (
        <div className="puzzle-completion-message">
          <h2>Congratulations! 🎉</h2>
          <p>
            You completed the puzzle in {formatTime(gameState.timer)} with{" "}
            {gameState.moves} moves!
          </p>
        </div>
      )}
    </div>
  );
};

export default PuzzleGame;
