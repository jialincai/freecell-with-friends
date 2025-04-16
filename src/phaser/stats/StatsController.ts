import { deserializeStats, serializeStats, Stats } from "@phaser/stats/state/Stats";
import { StatsView } from "@phaser/stats/StatsView";
import { withPauseTime, withStartTime } from "@phaser/stats/domain/StatsLogic";
import { STORAGE_KEY } from "@phaser/constants/storage";

export class StatsController {
  public model: Stats;
  public readonly view: StatsView;

  constructor(scene: Phaser.Scene, model: Stats) {
    this.model = model;
    this.loadStats();

    this.view = new StatsView(scene, this.model);
    this.updateTimeDisplay();

    document.addEventListener("visibilitychange", () => {
      const now = Date.now();

      if (document.hidden) {
        this.model.state = withPauseTime(this.model.state, now);
      } else {
        const offset = now - this.model.state.pauseTime;
        this.model.state = withStartTime(
          this.model.state,
          this.model.state.startTime + offset,
        );
      }

      this.saveStats();
    });
  }

  public updateTimeDisplay(): void {
    const elapsed = Date.now() - this.model.state.startTime;
    this.view.setTimerText(this.formatElapsedTime(elapsed));
    this.saveStats();
  }

  public saveStats(): void {
    localStorage.setItem(STORAGE_KEY, serializeStats(this.model));
  }

  public loadStats(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    const restored = raw ? deserializeStats(raw) : null;
  
    if (restored) {
      this.model.data = restored.data;
      this.model.state = restored.state;
    }
  }

  private formatElapsedTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");

    return `Time: ${minutes}:${seconds}`;
  }
}
