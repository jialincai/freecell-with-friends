"use client";

import { IRefPhaserGame, PhaserGame } from "@components/PhasorGame";
import { useRef } from "react";

const FreecellGame: React.FC = () => {
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  return (
    <div>
      <PhaserGame ref={phaserRef} />
    </div>
  );
};

export default FreecellGame;
