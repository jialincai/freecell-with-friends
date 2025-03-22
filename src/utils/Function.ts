import { EventEmitter } from "events";

export type PubSubStack<T> = {
  push(item: T): void;
  pop(): void;
  subscribe(event: string, listener: (item: T) => void): void;
};

// Stack with push/pop events
export function createPubSubStack<T>() {
  const items: T[] = [];
  const events = new EventEmitter();

  return {
    push(item: T): void {
      items.push(item);
      events.emit("push", item);
    },
    pop(): void {
      const item = items.pop();
      if (item) events.emit("pop", item);
    },
    subscribe(event: string, listener: (item: T) => void): void {
      events.on(event, listener);
    },
  };
}

// Executable and undoable command
export interface Command {
  do(): void;
  undo(): void;
}

// Group of commands with batch do/undo
export type CompositeCommand<T extends Command = Command> = Command & {
  type: "composite";
  commands: T[];
};

// Builds a composite command from multiple commands
export function createCompositeCommand<T extends Command>(
  commands: T[],
): CompositeCommand<T> {
  return {
    type: "composite",
    commands,
    do: () => commands.forEach((cmd) => cmd.do()),
    undo: () => [...commands].reverse().forEach((cmd) => cmd.undo()),
  };
}
