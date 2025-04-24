import React from "react";
import "../styles/components.css";

const Header: React.FC = () => {
  return (
    <header className="header">
      <h1 className="header-title">Jigsaw Puzzle Game</h1>
      <p className="header-subtitle">
        Drag and drop pieces to solve the puzzle!
      </p>
    </header>
  );
};

export default Header;
