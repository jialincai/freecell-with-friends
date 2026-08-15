import * as Phaser from "phaser";

export default class Boot extends Phaser.Scene {
  public constructor() {
    super("Boot");
  }

  public preload(): void {
    console.log("Boot: preload start, loading img/loading.png", {
      href: window.location.href,
      protocol: window.location.protocol,
      baseURL: this.load.baseURL,
      path: this.load.path,
    });

    this.load.on("filestart", (file: Phaser.Loader.File) => {
      console.log("Boot: filestart", { key: file.key, url: file.url });
    });

    this.load.on("filecomplete", (key: string, type: string) => {
      console.log("Boot: filecomplete", { key, type });
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error("Boot: loaderror", {
        key: file.key,
        url: file.url,
        type: file.type,
      });
    });

    // Diagnostic: fetch the same asset directly (outside Phaser's XHR loader)
    // to tell whether a hang is in Phaser's loader or the network request itself.
    const diagnosticUrl = "img/loading.png";
    const diagnosticStart = performance.now();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      console.error("Boot: diagnostic fetch timed out after 8000ms", {
        url: diagnosticUrl,
      });
      controller.abort();
    }, 8000);
    fetch(diagnosticUrl, { signal: controller.signal })
      .then((res) => {
        window.clearTimeout(timeoutId);
        console.log("Boot: diagnostic fetch resolved", {
          url: diagnosticUrl,
          status: res.status,
          ok: res.ok,
          contentType: res.headers.get("content-type"),
          contentLength: res.headers.get("content-length"),
          durationMs: Math.round(performance.now() - diagnosticStart),
        });
      })
      .catch((err) => {
        window.clearTimeout(timeoutId);
        console.error("Boot: diagnostic fetch failed", {
          url: diagnosticUrl,
          err,
          durationMs: Math.round(performance.now() - diagnosticStart),
        });
      });

    this.load.image("img_load", "img/loading.png");
  }

  public create(): void {
    console.log("Boot: create, transitioning to Preloader scene");
    this.scene.start("Preloader");
  }
}
