"use client";

import { forwardRef, useEffect, useRef } from "react";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const PhaserGame = forwardRef<IRefPhaserGame>(function PhaserGame(_, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const initGame = async () => {
      if (!containerRef.current || gameRef.current) return;

      const { initializeGame } = await import("phaser/main");

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (width > 0 && height > 0) {
        gameRef.current = initializeGame(containerRef.current);

        // Set external ref (if used)
        const refValue = { game: gameRef.current, scene: null };
        if (typeof ref === "function") {
          ref(refValue);
        } else if (ref) {
          ref.current = refValue;
        }
      } else {
        console.warn("Phaser container is not properly sized.");
      }
    };

    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [ref]);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
});