import { ISaveable } from "@utils/save/ISaveable";
import { Session } from "@phaser/session/Session";

class SessionSaveable implements ISaveable<Session> {
  public id = "session";

  constructor(
    public get: () => Session,
    public set: (data: Session) => void,
  ) {}

  getSnapshot(): Session {
    return structuredClone(this.get());
  }

  loadFromSnapshot(data: Session): void {
    this.set(data);
  }
}

export default SessionSaveable;
