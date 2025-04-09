import { EventEmitter } from "events";

export class PubSubStack<T> {
  private items: T[];
  private events: EventEmitter;

  constructor() {
    this.items = [];
    this.events = new EventEmitter();
  }

  push(item: T): void {
    this.items.push(item);
    this.events.emit("push", item);
  }

  pop(): void {
    const item = this.items.pop();
    if (item) this.events.emit("pop", item);
  }

  clear(): void {
    this.items = [];
    this.events.emit("clear");
  }

  subscribe(event: string, listener: (item: T) => void): void {
    this.events.on(event, listener);
  }
}

export interface Command {
  do(): void;
  undo(): void;
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
