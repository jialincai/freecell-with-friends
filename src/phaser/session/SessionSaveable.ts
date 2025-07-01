import { ISaveable } from "@utils/save/ISaveable";
import { Session } from "@phaser/session/Session";

export class SessionSaveable implements ISaveable<Session> {
  public id = "session";
  public ref: Session;

  constructor(session: Session) {
    this.ref = session;
  }

  getSnapshot(): Session {
    return structuredClone(this.ref);
  }

  loadFromSnapshot(data: Session): void {
    this.ref.data = { ...data.data };
    this.ref.state = { ...data.state };
  }
}
