import * as Phaser from "phaser";
import { dlog, derror } from "@/utils/debugLog";

export default class Boot extends Phaser.Scene {
  public constructor() {
    super("Boot");
  }

  public preload(): void {
    // Phaser's load.baseURL/load.path are "" by default (expected) — with
    // both empty, "img/loading.png" is resolved as a *relative* URL against
    // document.baseURI, not against the site root. If the page URL isn't
    // exactly "/" (trailing slash, query string, or an in-app browser like
    // Instagram/Facebook rewriting the URL), this resolves to the wrong path.
    const resolvedImageUrl = new URL("img/loading.png", document.baseURI).href;
    dlog("Boot: preload start, loading img/loading.png", {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      protocol: window.location.protocol,
      documentBaseURI: document.baseURI,
      resolvedImageUrl,
      loaderBaseURL: this.load.baseURL,
      loaderPath: this.load.path,
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

    this.load.image("img_load", "img/loading.png");
  }

  public create(): void {
    dlog("Boot: create, transitioning to Preloader scene");
    this.scene.start("Preloader");
  }
}
