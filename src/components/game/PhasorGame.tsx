"use client";

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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

    const [gameLoaded, setGameLoaded] = useState(false);
    const { status: sessionStatus } = useSession();
    const deal = useDailyDeal();

    useLayoutEffect(() => {
      if (gameRef.current === null) {
        const loadGame = async () => {
          const { default: StartGame } = await import("@/phaser/main");
          gameRef.current = StartGame(containerId, deal.seed);
          setGameLoaded(true);
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
          setGameLoaded(false);
        }
      };
    }, [ref, deal]);

    // Syncs a completion to the server. Two triggers:
    // 1. The live "game-completed" event, fired the moment the game is won.
    // 2. Immediately on mount/login, in case the local save was already
    //    completed anonymously and never made it to the server.
    useEffect(() => {
      let registeredCompletionEvent = false;

      const postCompletion = async (
        completionTimeMs: number,
        moveArray: CardMoveSequence[],
      ) => {
        if (sessionStatus !== "authenticated") return;

        try {
          const res = await fetch("/api/game/completion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completionTimeMs, moveArray }),
          });

          if (!res.ok) throw new Error(await res.text());
        } catch (err) {
          console.error("Failed to sync completion:", err);
        }
      };

      // Trigger 1: game already complete locally (e.g. an anonymous
      // completion) at the moment we're mounted/authenticated.
      const syncCompletionOnLogin = () => {
        const scene = gameRef.current?.scene.getScene("Game") as
          | Game
          | undefined;
        if (!scene || !scene.isComplete()) return;

        const { elapsedTimeMs, moveArray } = scene.getProgress();
        postCompletion(elapsedTimeMs, moveArray);
      };
      syncCompletionOnLogin();

      // Trigger 2: game completes live, during this session.
      const loadEventBus = async () => {
        const { EventBus } = await import("@/phaser/EventBus");
        if (registeredCompletionEvent) return;
        EventBus.on("game-completed", postCompletion);
      };
      loadEventBus();

      return () => {
        import("@/phaser/EventBus").then(({ EventBus }) => {
          EventBus.off("game-completed", postCompletion);
        });
        registeredCompletionEvent = false;
      };
    }, [sessionStatus, deal, gameLoaded]);

    // Periodically syncs local game progress to server.
    // See SERVER_SYNC_INTERVAL_MS.
    // Stops polling once the game is complete.
    useEffect(() => {
      if (sessionStatus !== "authenticated") return;

      const sync = async () => {
        const scene = gameRef.current?.scene.getScene("Game") as
          | Game
          | undefined;
        if (!scene || scene.isComplete()) return;

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
      };

      const intervalId = setInterval(sync, SERVER_SYNC_INTERVAL_MS);
      return () => clearInterval(intervalId);
    }, [sessionStatus, deal]);

    return <div id={containerId} ref={containerRef}></div>;
  },
);
