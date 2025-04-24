import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import PuzzleGame from "./components/PuzzleGame";
import Header from "./components/Header";
import AppContainer from "./components/AppContainer";
import GameControls from "./components/GameControls";
import { PUZZLE_IMAGES } from "./constants/gameSettings";

function App() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [selectedImage, setSelectedImage] = useState(PUZZLE_IMAGES[0]);

  return (
    <div>
      <Header />
      <GameControls
        difficulty={difficulty}
        selectedImage={selectedImage}
        onDifficultyChange={setDifficulty}
        onImageChange={setSelectedImage}
      />
      <AppContainer>
        <DndContext>
          <PuzzleGame difficulty={difficulty} selectedImage={selectedImage} />
        </DndContext>
      </AppContainer>
    </div>
  );
}

export default App;
