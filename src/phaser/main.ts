import * as Phaser from "phaser";

import InitState from "./InitState";
import GameState from "@phaser/game/state/GameState";
import PreInitState from "./PreInitState";
import { SCREEN_DIMENSIONS } from "./constants/dimensions";

const config: Phaser.Types.Core.GameConfig = {
  antialias: false,
  antialiasGL: false,
  backgroundColor: "#000",
  height: SCREEN_DIMENSIONS.height,
  parent: "game-container",
  scene: [PreInitState, InitState, GameState],
  type: Phaser.AUTO,
  width: SCREEN_DIMENSIONS.width,
  scale: {
    mode: Phaser.Scale.FIT,
  },
};

export const initializeGame = () => new Phaser.Game(config);
