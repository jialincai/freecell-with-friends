import * as Phaser from "phaser";
import InitState from "@phaser/InitState";
import GameState from "@phaser/game/state/GameState";
import PreInitState from "@phaser/PreInitState";
import { SCREEN_DIMENSIONS } from "./constants/dimensions";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#000",
  antialias: false,
  antialiasGL: false,
  width: SCREEN_DIMENSIONS.width,
  height: SCREEN_DIMENSIONS.height,
  scene: [PreInitState, InitState, GameState],
  scale: {
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
  },
};

const StartGame = (parent: string) => {
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;
