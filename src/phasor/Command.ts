import Card from "./Card";
import { PileId } from "./constants/table";

export interface Command {
  do(): void;
  undo(): void;
}

export class CardMoveCommand implements Command {
  constructor(
    private card: Card,
    private source: PileId,
    private p1: number,
    private destination: PileId,
    private p2: number,
  ) {}

  do(): void {
    this.card.reposition(this.destination, this.p2);
  }

  undo(): void {
    this.card.reposition(this.source, this.p1);
  }
}

export class CompositeCommand implements Command {
  private readonly commands: Command[];

  constructor(...commands: Command[]) {
    this.commands = commands;
  }

  do(): void {
    this.commands.forEach((command) => command.do());
  }

  undo(): void {
    [...this.commands].reverse().forEach((command) => command.undo());
  }
}

export class CommandManager {
  private commands: Command[];

  constructor() {
    this.commands = new Proxy<Command[]>([], {
      set: (target, prop, value) => {
        const result = Reflect.set(target, prop, value);
        if (prop === (target.length - 1).toString()) {
          value?.do();
        }
        return result;
      },
      deleteProperty: (target, prop) => {
        if (prop === (target.length - 1).toString()) {
          target[target.length - 1]?.undo();
        }
        return Reflect.deleteProperty(target, prop);
      },
    });
  }

  push(command: Command): void {
    this.commands.push(command);
  }

  pop(): void {
    if (this.commands.length === 0) return;
    this.commands.pop();
  }

  get history(): ReadonlyArray<Command> {
    return this.commands;
  }
}
