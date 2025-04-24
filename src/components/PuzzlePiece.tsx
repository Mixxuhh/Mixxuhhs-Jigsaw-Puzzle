import React, { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { PuzzlePiece as PuzzlePieceType } from "../types/puzzle";
import { GAME_CONTAINER_SIZE } from "../constants/gameSettings";
import "../styles/PuzzleGame.css";

interface Props {
  piece: PuzzlePieceType;
  isPlaced: boolean;
}

const PuzzlePieceComponent: React.FC<Props> = ({ piece, isPlaced }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: piece.id,
      data: {
        type: "puzzle-piece",
        piece,
      },
    });

  const style: CSSProperties = {
    width: piece.width,
    height: piece.height,
    position: isPlaced ? "absolute" : "relative",
    transform: transform
      ? `translate3d(${
          transform.x + (isPlaced ? piece.currentPosition.x : 0)
        }px, ${transform.y + (isPlaced ? piece.currentPosition.y : 0)}px, 0)`
      : isPlaced
      ? `translate(${piece.currentPosition.x}px, ${piece.currentPosition.y}px)`
      : "none",
    backgroundImage: `url(${piece.imageUrl})`,
    backgroundSize: `${GAME_CONTAINER_SIZE}px ${GAME_CONTAINER_SIZE}px`,
    backgroundPosition: `-${piece.correctPosition.x}px -${piece.correctPosition.y}px`,
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 1000 : isPlaced ? 1 : 2,
    transition: isDragging ? "none" : "transform 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      className={`puzzle-piece ${isDragging ? "dragging" : ""} ${
        isPlaced ? "placed" : ""
      }`}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

export default PuzzlePieceComponent;
