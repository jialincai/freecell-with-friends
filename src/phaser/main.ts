import * as Phaser from "phaser";
import InitState from "@phaser/InitState";
import GameState from "@phaser/game/state/GameState";
import PreInitState from "@phaser/PreInitState";

export const initializeGame = (container: HTMLElement): Phaser.Game => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: container,
    backgroundColor: "#000",
    antialias: false,
    antialiasGL: false,
    width: container.clientWidth,
    height: container.clientHeight,
    scene: [PreInitState, InitState, GameState],
    scale: {
      mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
      // autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  return new Phaser.Game(config);
};
