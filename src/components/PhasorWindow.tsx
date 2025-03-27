"use client";

import React, { useEffect } from "react";
import "@styles/PhasorWindow.module.css";

const PhasorWindow: React.FC = () => {
  useEffect(() => {
    const loadPhasorWindow = async () => {
      const { initializeGame } = await import("phaser/main");
      initializeGame();
    };

    loadPhasorWindow();
  }, []);

  return <div id="game-container"></div>;
};

export default PhasorWindow;
