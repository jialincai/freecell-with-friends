import { Session } from "@phaser/session/Session";
import { SessionView } from "@phaser/session/SessionView";
import {
  withPauseTime,
  withStartTime,
} from "@phaser/session/domain/SessionLogic";

export class SessionController {
  public model: Session;
  public readonly view: SessionView;

  constructor(scene: Phaser.Scene, model: Session) {
    this.model = model;

    this.view = new SessionView(scene, this.model);
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
