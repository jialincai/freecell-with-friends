import * as Phaser from "phaser";

export default class Boot extends Phaser.Scene {
  public constructor() {
    super("Boot");
  }

  public preload(): void {
    console.log("Boot: preload start, loading img/loading.png");

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error("Boot: loaderror", {
        key: file.key,
        url: file.url,
        type: file.type,
      });
    });

    this.load.image("img_load", "img/loading.png");
  }

  public create(): void {
    console.log("Boot: create, transitioning to Preloader scene");
    this.scene.start("Preloader");
  }
}
