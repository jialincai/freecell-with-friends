"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { CardMoveSequence } from "@/phaser/move/CardMoveSequence";
import type Game from "@/phaser/scenes/Game";
import { useDailyDeal } from "@/components/context/DealContext";
import "@/styles/game/PhasorGame.module.css";
import { useSession } from "next-auth/react";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

// Server sync runs on its own cadence, independent of the local autosave
// cadence in Game.ts.
const SERVER_SYNC_INTERVAL_MS = 30_000;

export const PhaserGame = forwardRef<IRefPhaserGame>(
  function PhaserGame(_, ref) {
    const containerId = "game-container";
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    const { status: sessionStatus } = useSession();
    const deal = useDailyDeal();

    useLayoutEffect(() => {
      if (gameRef.current === null) {
        const loadGame = async () => {
          const { default: StartGame } = await import("@/phaser/main");
          gameRef.current = StartGame(containerId, deal.seed);
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
    }, [ref, deal]);

    useEffect(() => {
      const loadEventBus = async () => {
        const { EventBus } = await import("@/phaser/EventBus");

        EventBus.on(
          "game-completed",
          async (completionTimeMs: number, moveArray: CardMoveSequence[]) => {
            if (sessionStatus !== "authenticated") return;

            try {
              const res = await fetch("/api/game/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  completionTimeMs,
                  moveArray,
                }),
              });

              if (!res.ok) throw new Error(await res.text());
            } catch (err) {
              console.error("Failed to submit completion:", err);
            }
          },
        );
      };

      loadEventBus();
    }, [sessionStatus, deal]);

    useEffect(() => {
      if (sessionStatus !== "authenticated") return;

      const intervalId = setInterval(async () => {
        const scene = gameRef.current?.scene.getScene("Game") as
          | Game
          | undefined;
        if (!scene) return;

        const { elapsedTimeMs, moveArray } = scene.getProgress();

        try {
          const res = await fetch("/api/game/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              elapsedTimeMs,
              moveArray,
            }),
          });

          if (!res.ok) throw new Error(await res.text());
        } catch (err) {
          console.error("Failed to sync game progress:", err);
        }
      }, SERVER_SYNC_INTERVAL_MS);

      return () => clearInterval(intervalId);
    }, [sessionStatus, deal]);

    return <div id={containerId} ref={containerRef}></div>;
  },
);
