"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { CardMoveSequence } from "@/phaser/move/CardMoveSequence";
import { useDailyDeal } from "@/components/context/DealContext";
import "@/styles/game/PhasorGame.module.css";
import { useSession } from "next-auth/react";
import { dlog, derror } from "@/utils/debugLog";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const PhaserGame = forwardRef<IRefPhaserGame>(
  function PhaserGame(_, ref) {
    const containerId = "game-container";
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const sessionStatusRef =
      useRef<ReturnType<typeof useSession>["status"]>(undefined);

    const deal = useDailyDeal();
    sessionStatusRef.current = useSession().status;

    useLayoutEffect(() => {
      dlog("PhaserGame: useLayoutEffect fired", {
        hasExistingGame: gameRef.current !== null,
        seed: deal.seed,
        userAgent: navigator.userAgent,
      });

      if (gameRef.current === null) {
        const loadGame = async () => {
          dlog("PhaserGame: (re)creating Phaser.Game instance", {
            seed: deal.seed,
            time: new Date().toISOString(),
          });

          try {
            const { default: StartGame } = await import("@/phaser/main");
            gameRef.current = StartGame(containerId, deal.seed);
            dlog("PhaserGame: Phaser.Game instance created successfully", {
              hasGame: gameRef.current !== null,
            });
          } catch (err) {
            derror("PhaserGame: failed to create Phaser.Game instance", err);
            throw err;
          }
        };
        loadGame().catch((err) => {
          derror("PhaserGame: loadGame() rejected", err);
        });

        if (typeof ref === "function") {
          ref({ game: gameRef.current, scene: null });
        } else if (ref) {
          ref.current = { game: gameRef.current, scene: null };
        }
      }

      return () => {
        dlog("PhaserGame: useLayoutEffect cleanup", {
          hasGame: gameRef.current !== null,
        });
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, [ref, deal]);

    useEffect(() => {
      let cleanup = () => {};

      import("@/phaser/EventBus")
        .then(({ EventBus }) => {
          dlog(
            "PhaserGame: EventBus loaded, registering game-completed handler",
          );
          const handler = async (
            completionTimeMs: number,
            moveArray: CardMoveSequence[],
          ) => {
            dlog("PhaserGame: game-completed event received", {
              completionTimeMs,
              sessionStatus: sessionStatusRef.current,
            });

            if (sessionStatusRef.current !== "authenticated") return;

            try {
              const res = await fetch("/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  completionTimeMs,
                  moveArray,
                }),
              });

              if (!res.ok) throw new Error(await res.text());
              dlog("PhaserGame: completion submitted successfully");
            } catch (err) {
              derror("Failed to submit completion:", err);
            }
          };

          EventBus.on("game-completed", handler);
          cleanup = () => EventBus.off("game-completed", handler);
        })
        .catch((err) => {
          derror("PhaserGame: failed to load EventBus module", err);
        });

      return () => cleanup();
    }, [deal]);

    return <div id={containerId} ref={containerRef}></div>;
  },
);
