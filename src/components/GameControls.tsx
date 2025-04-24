import React from "react";
import { PUZZLE_IMAGES } from "../constants/gameSettings";
import "../styles/PuzzleGame.css";

interface Props {
  difficulty: "easy" | "medium" | "hard";
  selectedImage: string;
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void;
  onImageChange: (image: string) => void;
}

// Helper function to get a friendly name for the image
const getFriendlyImageName = (imagePath: string): string => {
  const fileName = imagePath.split("/").pop() || "";
  // Remove file extension and replace underscores/hyphens with spaces
  return fileName
    .replace(/\.[^/.]+$/, "") // Remove file extension
    .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
};

const GameControls: React.FC<Props> = ({
  difficulty,
  selectedImage,
  onDifficultyChange,
  onImageChange,
}) => {
  return (
    <div className="game-controls-container">
      <div className="control-group">
        <label className="control-label" htmlFor="difficulty">
          Difficulty Level:
        </label>
        <select
          className="control-select"
          id="difficulty"
          value={difficulty}
          onChange={(e) =>
            onDifficultyChange(e.target.value as "easy" | "medium" | "hard")
          }
        >
          <option value="easy">Easy (3x3)</option>
          <option value="medium">Medium (4x4)</option>
          <option value="hard">Hard (5x5)</option>
        </select>
      </div>

      <div className="control-group">
        <label className="control-label" htmlFor="image">
          Select Puzzle Image:
        </label>
        <select
          className="control-select"
          id="image"
          value={selectedImage}
          onChange={(e) => onImageChange(e.target.value)}
        >
          {PUZZLE_IMAGES.map((image) => (
            <option key={image} value={image}>
              {getFriendlyImageName(image)}
            </option>
          ))}
        </select>

        <div className="image-preview">
          <img
            className="preview-image"
            src={selectedImage}
            alt="Puzzle preview"
          />
        </div>
      </div>
    </div>
  );
};

export default GameControls;
