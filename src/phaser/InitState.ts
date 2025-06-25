import * as Phaser from "phaser";

// Card images
import { spritesheets } from "@phaser/constants/assets";
import { baseURL } from "@phaser/constants/loading";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  key: "InitState",
  visible: false,
};

export default class InitState extends Phaser.Scene {
  public constructor() {
    super(sceneConfig);
  }

  // eslint-disable-next-line max-lines-per-function
  public preload(): void {
    // Set base url
    this.load.baseURL = baseURL;

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
      progressBar.fillStyle(0x000000, 1);
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
    this.scene.start("GameState");
  }
}
