"use client";

import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "@components/game/PhasorGame";

const FreecellGame = () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  // TODO: implement pause/resume calls to Phaser game when an overlay is active
  // const pause = () => {
  //   if (!phaserRef.current) return;

  //   const scene = phaserRef.current.scene;
  //   if (scene && scene.scene.key === "Game") {
  //     (scene as Phaser.Game).pause();
  //   }
  // };

  // const resume = () => {
  //   if (!phaserRef.current) return;

  //   const scene = phaserRef.current.scene;
  //   if (scene && scene.scene.key === "Game") {
  //     (scene as Phaser.Game).resume();
  //   }
  // };

  return (
    <div>
      <PhaserGame ref={phaserRef} />
    </div>
  );
};

export default FreecellGame;
