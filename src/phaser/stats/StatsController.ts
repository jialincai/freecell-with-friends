import { Stats } from "@phaser/stats/state/Stats";
import { StatsView } from "@phaser/stats/StatsView";
import {
  deserializeStats,
  serializeStats,
  withPauseTime,
  withStartTime,
} from "@phaser/stats/domain/StatsLogic";
import { STORAGE_KEY } from "@phaser/constants/storage";

export class StatsController {
  public model: Stats;
  public readonly view: StatsView;

  constructor(scene: Phaser.Scene, model: Stats) {
    this.model = model;
    this.loadStats();
    this.saveStats();

    this.view = new StatsView(scene, this.model);
    this.updateTimeDisplay();

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  public updateTimeDisplay(): void {
    const elapsedMs = Date.now() - this.model.state.startTime;
    this.view.setTimerText(this.formatElapsedTime(elapsedMs));
  }

  public saveStats(): void {
    localStorage.setItem(STORAGE_KEY, serializeStats(this.model));
  }

  public loadStats(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    const loadedStats = raw ? deserializeStats(raw) : null;

    if (!loadedStats || loadedStats.data.seed !== this.model.data.seed) return;

    this.model.state = loadedStats.state;
  }

  private handleVisibilityChange = (): void => {
    const now = Date.now();

    this.model.state = document.hidden
      ? withPauseTime(this.model.state, now)
      : withStartTime(
          this.model.state,
          this.model.state.startTime + (now - this.model.state.pauseTime),
        );

    this.saveStats();
  };

  private formatElapsedTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");

    return `Time: ${minutes}:${seconds}`;
  }
}
