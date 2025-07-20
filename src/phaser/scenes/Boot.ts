import * as Phaser from "phaser";

export default class Boot extends Phaser.Scene {
  public constructor() {
    super("Boot");
  }

  public preload(): void {
    this.load.image("img_load", "img/loading.png");
  }

  public create(): void {
    this.scene.start("Preloader");
  }
}
