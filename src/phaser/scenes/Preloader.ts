import * as Phaser from "phaser";

// Card images
import { spritesheets } from "@phaser/constants/assets";
import { baseURL } from "@phaser/constants/loading";
import { SCREEN_DIMENSIONS } from "@phaser/constants/dimensions";

export default class Preloader extends Phaser.Scene {
  public constructor() {
    super('Preloader');
  }

  public preload(): void {
    // Set base url
    this.load.baseURL = baseURL;

    // Background
    this.add
      .image(
        SCREEN_DIMENSIONS.width / 2,
        SCREEN_DIMENSIONS.height / 4,
        "img_load",
      )
      .setScale(2);

    const { width, height } = this.cameras.main;

    // Progress box (background of the progress bar)
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0xaaaaaa, 0.8);
    const barWidth = 600;
    const barHeight = 100;
    const barX = (width - barWidth) / 2;
    const barY = height / 2;
    progressBox.fillRect(barX, barY, barWidth, barHeight);

    // Progress fill
    const progressBar = this.add.graphics();

    // Progress update
    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        barX + 2,
        barY + 2,
        (barWidth - 4) * value,
        barHeight - 4,
      );
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // Spritesheets
    spritesheets.forEach(({ file, frameHeight, frameWidth, key }) => {
      this.load.spritesheet(key, file, { frameHeight, frameWidth });
    });
  }

  public create(): void {
    this.scene.start("Game");
  }
}
