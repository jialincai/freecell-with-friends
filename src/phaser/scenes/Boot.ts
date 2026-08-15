import * as Phaser from "phaser";
import { dlog, derror } from "@/utils/debugLog";

export default class Boot extends Phaser.Scene {
  private heartbeatId!: number;

  public constructor() {
    super("Boot");
  }

  public preload(): void {
    // Heartbeat: setInterval only needs the JS event loop alive, not the
    // network, to fire. If this stops printing, the page/JS thread itself
    // died (crash or OOM kill) rather than a request hanging.
    const heartbeatStart = performance.now();
    this.heartbeatId = window.setInterval(() => {
      dlog("Boot: heartbeat", {
        elapsedMs: Math.round(performance.now() - heartbeatStart),
      });
    }, 500);

    dlog("Boot: preload entered");

    const rendererTypeNames: Record<number, string> = {
      [Phaser.CANVAS]: "CANVAS",
      [Phaser.WEBGL]: "WEBGL",
      [Phaser.HEADLESS]: "HEADLESS",
    };
    dlog("Boot: renderer/canvas info", {
      rendererType:
        rendererTypeNames[this.game.renderer.type] ?? this.game.renderer.type,
      canvasWidth: this.game.canvas?.width,
      canvasHeight: this.game.canvas?.height,
      canvasStyleWidth: this.game.canvas?.style.width,
      canvasStyleHeight: this.game.canvas?.style.height,
      scaleWidth: this.scale.width,
      scaleHeight: this.scale.height,
      devicePixelRatio: window.devicePixelRatio,
    });

    if (this.game.renderer.type === Phaser.WEBGL) {
      const canvas = this.game.canvas;
      canvas.addEventListener("webglcontextlost", (event) => {
        derror("Boot: webglcontextlost", { type: event.type });
      });
      canvas.addEventListener("webglcontextrestored", () => {
        dlog("Boot: webglcontextrestored");
      });
    }

    // Phaser's load.baseURL/load.path are "" by default (expected) — with
    // both empty, "img/loading.png" is resolved as a *relative* URL against
    // document.baseURI, not against the site root. If the page URL isn't
    // exactly "/" (trailing slash, query string, or an in-app browser like
    // Instagram/Facebook rewriting the URL), this resolves to the wrong path.
    const resolvedImageUrl = new URL("img/loading.png", document.baseURI).href;
    dlog("Boot: resolved image URL computed", {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      protocol: window.location.protocol,
      documentBaseURI: document.baseURI,
      resolvedImageUrl,
      loaderBaseURL: this.load.baseURL,
      loaderPath: this.load.path,
    });

    dlog("Boot: registering loader listeners");

    this.load.on("start", () => {
      dlog("Boot: loader start event (actual network/decode begins now)");
    });

    this.load.on("filestart", (file: Phaser.Loader.File) => {
      dlog("Boot: filestart", { key: file.key, url: file.url });
    });

    this.load.on("filecomplete", (key: string, type: string) => {
      dlog("Boot: filecomplete", { key, type });
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      derror("Boot: loaderror", {
        key: file.key,
        url: file.url,
        type: file.type,
      });
    });

    // Diagnostic: fetch the same asset directly (outside Phaser's XHR loader)
    // to tell whether a hang is in Phaser's loader or the network request itself.
    const diagnosticUrl = resolvedImageUrl;
    const diagnosticStart = performance.now();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      derror("Boot: diagnostic fetch timed out after 8000ms", {
        url: diagnosticUrl,
      });
      controller.abort();
    }, 8000);
    dlog("Boot: starting diagnostic fetch");
    fetch(diagnosticUrl, { signal: controller.signal })
      .then((res) => {
        window.clearTimeout(timeoutId);
        dlog("Boot: diagnostic fetch resolved", {
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
        derror("Boot: diagnostic fetch failed", {
          url: diagnosticUrl,
          err,
          durationMs: Math.round(performance.now() - diagnosticStart),
        });
      });

    dlog("Boot: calling this.load.image", { key: "img_load" });
    this.load.image("img_load", "img/loading.png");
    dlog("Boot: this.load.image call returned");
  }

  public create(): void {
    window.clearInterval(this.heartbeatId);
    dlog("Boot: create, transitioning to Preloader scene");
    this.scene.start("Preloader");
  }
}
