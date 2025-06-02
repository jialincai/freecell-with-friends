"use client";

import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "@components/game/PhasorGame";

const FreecellGame = () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  return (
    <div>
      <PhaserGame ref={phaserRef} />
    </div>
  );
};

export default FreecellGame;
