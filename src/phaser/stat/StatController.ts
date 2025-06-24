import { Stat } from "@phaser/stat/Stat";
import { StatView } from "@phaser/stat/StatView";
import { withPauseTime, withStartTime } from "@phaser/stat/domain/StatLogic";

export class StatController {
  public model: Stat;
  public readonly view: StatView;

  constructor(scene: Phaser.Scene, model: Stat) {
    this.model = model;

    this.view = new StatView(scene, this.model);
    this.updateTimeDisplay();

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  public updateTimeDisplay(): void {
    const elapsedMs = Date.now() - this.model.state.startTime;
    this.view.setTimerText(this.formatElapsedTime(elapsedMs));
  }

  private handleVisibilityChange = (): void => {
    const now = Date.now();

    this.model.state = document.hidden
      ? withPauseTime(this.model.state, now)
      : withStartTime(
          this.model.state,
          this.model.state.startTime + (now - this.model.state.pauseTime),
        );
  };

  private formatElapsedTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");

    return `Time: ${minutes}:${seconds}`;
  }
}
