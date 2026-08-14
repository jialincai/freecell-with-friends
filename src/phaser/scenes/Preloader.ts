import * as Phaser from "phaser";

// Card images
import { spritesheets } from "@/phaser/constants/assets";
import { SCREEN_DIMENSIONS } from "@/phaser/constants/dimensions";

export default class Preloader extends Phaser.Scene {
  public constructor() {
    super("Preloader");
  }

  public preload(): void {
    console.log("Preloader: preload start", {
      spritesheets: spritesheets.map(({ key, file }) => ({ key, file })),
    });

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
      console.log("Preloader: load progress", value);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        barX + 2,
        barY + 2,
        (barWidth - 4) * value,
        barHeight - 4,
      );
    });

    this.load.on("filecomplete", (key: string, type: string) => {
      console.log("Preloader: file loaded", { key, type });
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error("Preloader: loaderror", {
        key: file.key,
        url: file.url,
        type: file.type,
      });
    });

    this.load.on("complete", () => {
      console.log("Preloader: load complete", {
        textureKeys: this.textures.getTextureKeys(),
      });
      progressBar.destroy();
      progressBox.destroy();
    });

    // Spritesheets
    spritesheets.forEach(({ file, frameHeight, frameWidth, key }) => {
      this.load.spritesheet(key, file, { frameHeight, frameWidth });
    });
  }

  public create(): void {
    console.log("Preloader: create, transitioning to Game scene");
    this.scene.start("Game");
  }
}
