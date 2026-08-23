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
import type { Meta } from "@/phaser/meta/Meta";
import type { Session } from "@/phaser/session/Session";
import SaveController from "@/utils/save/SaveController";
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
      if (sessionStatus === "loading") return;

      if (gameRef.current === null) {
        const loadGame = async () => {
          const { default: StartGame } = await import("@/phaser/main");

          // Step 1: read local save directly (bypassing Game.ts/SaveController's
          // Phaser-side loading, since no scene exists yet to own it). A seed
          // mismatch means the save is for a previous day's deal, so
          // `activeLocalSave` is false and every field below falls back to
          // its fresh-game default.
          const localSave = SaveController.getSave();
          const localMeta = localSave?.state.chunks.meta as Meta | undefined;
          const activeLocalSave = localMeta?.data.seed === deal.seed;

          let elapsedTimeMs = activeLocalSave
            ? ((localSave?.state.chunks.session as Session | undefined)?.state
                .timeElapsedMs ?? 0)
            : 0;
          let moveArray = activeLocalSave
            ? ((localSave?.state.chunks.move as
                | CardMoveSequence[]
                | undefined) ?? [])
            : [];
          const localCompleted = activeLocalSave
            ? (localMeta?.state.complete ?? false)
            : false;

          // Step 2: for authenticated users, the server is normally
          // authoritative (it may hold progress from another device). The one
          // exception is a local completion the server doesn't know about yet
          // (e.g. completed anonymously, then just logged in) — favor local
          // there so the completion-sync effect below can push it up, rather
          // than starting the scene from the server's stale/empty progress.
          if (sessionStatus === "authenticated") {
            try {
              const res = await fetch("/api/game/progress");
              if (res.ok) {
                const server = await res.json();
                const preferLocal = localCompleted && !server.completed;
                if (server.started && !preferLocal) {
                  elapsedTimeMs = server.elapsedTimeMs;
                  // `moves` is stored as JSONB but has been observed coming
                  // back over the wire as a raw JSON string — parse
                  // defensively so Phaser always receives a real array.
                  moveArray =
                    typeof server.moveArray === "string"
                      ? JSON.parse(server.moveArray)
                      : server.moveArray;
                }
              }
            } catch (err) {
              console.error("Failed to fetch game progress:", err);
            }
          }

          // Step 3: hand the scene a single resolved starting point — Game.ts
          // applies it unconditionally, with no server-vs-local branching of
          // its own.
          gameRef.current = StartGame(
            containerId,
            deal.seed,
            elapsedTimeMs,
            moveArray,
          );
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
    }, [ref, deal, sessionStatus]);

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
