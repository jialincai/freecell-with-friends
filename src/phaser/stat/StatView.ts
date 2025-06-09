import * as Phaser from "phaser";
import { BORDER_PAD_DIMENSIONS } from "@phaser/constants/dimensions";
import { Stat } from "@phaser/stat/Stat";
import { TEXT_COLOR } from "@phaser/constants/colors";
import { getHexColorString } from "@utils/Function";
import { FONT_FAMILY, FONT_SIZE } from "@phaser/constants/fonts";

export class StatView {
  private timer: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, _model: Stat) {
    this.timer = scene.add
      .text(
        scene.cameras.main.width - BORDER_PAD_DIMENSIONS.width,
        BORDER_PAD_DIMENSIONS.height,
        "Time: 0:00",
        {
          color: getHexColorString(TEXT_COLOR),
          fontSize: FONT_SIZE,
          fontFamily: FONT_FAMILY,
        },
      )
      .setOrigin(1, 0);
  }

  setTimerText(timerText: string): void {
    this.timer.setText(timerText);
  }
}
