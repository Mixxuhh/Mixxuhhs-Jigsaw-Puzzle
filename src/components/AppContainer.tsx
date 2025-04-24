import React from "react";
import "../styles/components.css";

interface AppContainerProps {
  children: React.ReactNode;
}

const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  return <div className="app-container">{children}</div>;
};

export default AppContainer;
