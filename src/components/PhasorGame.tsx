"use client";

import { forwardRef, useLayoutEffect, useRef } from "react";
import "@styles/PhasorGame.module.css";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const PhaserGame = forwardRef<IRefPhaserGame>(
  function PhaserGame(_, ref) {
    const containerId = "game-container";
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useLayoutEffect(() => {
      if (gameRef.current === null) {
        const loadGame = async () => {
          const { default: StartGame } = await import("phaser/main");
          gameRef.current = StartGame(containerId);
        };
        loadGame();

        if (typeof ref === "function") {
          ref({ game: gameRef.current, scene: null });
        } else if (ref) {
          ref.current = { game: gameRef.current, scene: null };
        }
      }

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, [ref]);

    return <div id={containerId} ref={containerRef}></div>;
  },
);
