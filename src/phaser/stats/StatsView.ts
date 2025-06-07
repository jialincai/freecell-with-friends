import * as Phaser from "phaser";
import { BORDER_PAD_DIMENSIONS } from "@phaser/constants/dimensions";
import { Stats } from "@phaser/stats/Stats";
import { TEXT_COLOR } from "@phaser/constants/colors";
import { getHexColorString } from "@utils/Function";
import { FONT_FAMILY, FONT_SIZE } from "@phaser/constants/fonts";

export class StatsView {
  private timer: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, _model: Stats) {
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
