"use client";

import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "@components/game/PhasorGame";
import { Deal } from "@lib/db/deals";

const FreecellGame = () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    const fetchSeed = async () => {
      try {
        const res = await fetch("/api/deal/current");
        if (!res.ok) throw new Error("Failed to fetch seed");
        const data = await res.json();
        setDeal(data.deal);
      } catch (err) {
        console.error(err, "Fallback to default:");
        setDeal({
          id: -1,
          seed: 123456,
          date: new Date().toISOString().slice(0, 10),
        });
      }
    };

    fetchSeed();
  }, []);

  const pause = () => {
    if (!phaserRef.current) return;

    const scene = phaserRef.current.scene;
    if (scene && scene.scene.key === "Game") {
      (scene as Phaser.Game).pause();
    }
  };

  const resume = () => {
    if (!phaserRef.current) return;

    const scene = phaserRef.current.scene;
    if (scene && scene.scene.key === "Game") {
      (scene as Phaser.Game).resume();
    }
  };

  if (!deal) return;

  return (
    <div>
      <PhaserGame ref={phaserRef} deal={deal} />
    </div>
  );
};

export default FreecellGame;
