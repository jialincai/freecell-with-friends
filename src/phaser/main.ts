import * as Phaser from "phaser";
import Preloader from "@phaser/scenes/Preloader";
import Game from "@phaser/scenes/Game";
import Boot from "@phaser/scenes/Boot";
import { SCREEN_DIMENSIONS } from "phaser/constants/dimensions";
import { BACKGROUND_COLOR } from "phaser/constants/colors";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: BACKGROUND_COLOR,
  width: SCREEN_DIMENSIONS.width,
  height: SCREEN_DIMENSIONS.height,
  scene: [Boot, Preloader, Game],
  scale: {
    mode: Phaser.Scale.FIT,
  },
};

const StartGame = (parent: string, seed: number) => {
  const game = new Phaser.Game({ ...config, parent });
  game.registry.set("seed", seed);
  return game;
};

export default StartGame;
