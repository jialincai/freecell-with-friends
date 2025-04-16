import { Stats } from "@phaser/stats/state/Stats";
import { StatsView } from "@phaser/stats/StatsView";
import { withPauseTime, withStartTime } from "@phaser/stats/domain/StatsLogic";

export class StatsController {
  public model: Stats;
  public readonly view: StatsView;

  constructor(scene: Phaser.Scene, stat: Stats) {
    this.model = stat;
    this.view = new StatsView(scene, stat);
    this.updateTimeDisplay();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.model.state = withPauseTime(this.model.state, Date.now());
      } else {
        const offset = Date.now() - this.model.state.pauseTime;
        this.model.state = withStartTime(
          this.model.state,
          this.model.state.startTime + offset,
        );
      }
    });
  }

  updateTimeDisplay(): void {
    const elapsedTimeInMs = Date.now() - this.model.state.startTime;
    this.view.setTimerText(this.formatTimer(elapsedTimeInMs));
  }

  private formatTimer(elapsedMs: number): string {
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `Time: ${minutes}:${seconds}`;
  }
}
