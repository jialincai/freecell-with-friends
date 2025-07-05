import { Session } from "@phaser/session/Session";
import { SessionView } from "@phaser/session/SessionView";
import { withTimeElapsedMs } from "@phaser/session/domain/SessionLogic";

export class SessionController {
  public model: Session;
  public readonly view: SessionView;

  constructor(scene: Phaser.Scene, model: Session) {
    this.model = model;
    this.view = new SessionView(scene, this.model);
    this.incrementTimer(0);
  }

  public incrementTimer(deltaMs: number): void {
    this.model.state = withTimeElapsedMs(
      this.model.state,
      this.model.state.timeElapsedMs + deltaMs,
    );
    this.view.updateTimerText(this.model.state.timeElapsedMs);
  }
}
