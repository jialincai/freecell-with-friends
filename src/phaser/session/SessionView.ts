import * as Phaser from "phaser";
import { BORDER_PAD_DIMENSIONS } from "@/phaser/constants/dimensions";
import { Session } from "@/phaser/session/Session";
import { TEXT_COLOR } from "@/phaser/constants/colors";
import { getHexColorString } from "@/utils/Function";
import { FONT_FAMILY, FONT_SIZE } from "@/phaser/constants/fonts";
import { formatTimerText } from "./domain/SessionLogic";

export class SessionView {
  private timer: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, model: Session) {
    this.timer = scene.add
      .text(
        scene.cameras.main.width - BORDER_PAD_DIMENSIONS.width,
        BORDER_PAD_DIMENSIONS.height,
        formatTimerText(model.state.timeElapsedMs),
        {
          color: getHexColorString(TEXT_COLOR),
          fontSize: FONT_SIZE,
          fontFamily: FONT_FAMILY,
        },
      )
      .setOrigin(1, 0);
  }

  updateTimerText(timeElapsedMs: number): void {
    this.timer.setText(formatTimerText(timeElapsedMs));
  }
}
