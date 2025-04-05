"use client";

import { forwardRef, useLayoutEffect, useRef } from "react";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const PhaserGame = forwardRef<IRefPhaserGame>(
  function PhaserGame(_, ref) {
    const game = useRef<Phaser.Game | null>(null);

    useLayoutEffect(() => {
      if (game.current === null) {
        const loadGame = async () => {
          const StartGame = (await import("phaser/main")).default;
          StartGame("game-container");
        };
        loadGame();

        if (typeof ref === "function") {
          ref({ game: game.current, scene: null });
        } else if (ref) {
          ref.current = { game: game.current, scene: null };
        }
      }

      return () => {
        if (game.current) {
          game.current.destroy(true);
          game.current = null;
        }
      };
    }, [ref]);

    return <div id="game-container"></div>;
  },
);
