import * as Phaser from "phaser";

import { baseURL } from "@phaser/constants/loading";

export default class Boot extends Phaser.Scene {
  public constructor() {
    super('Boot');
  }

  public preload(): void {
    this.load.baseURL = baseURL;
    this.load.image("img_load", "img/loading.png");
  }

  public create(): void {
    this.scene.start("Preloader");
  }
}
