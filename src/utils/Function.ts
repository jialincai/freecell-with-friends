import { EventEmitter } from "events";

/**
 * A generic stack that supports event-driven push and pop operations.
 * Subscribers can listen to "push" and "pop" events to react to changes.
 */
export class PubSubStack<T> {
  private items: T[];
  private events: EventEmitter;

  constructor() {
    this.items = [];
    this.events = new EventEmitter();
  }

  /**
   * Pushes an item onto the stack and emits a "push" event.
   * @param item The item to push onto the stack.
   */
  push(item: T): void {
    this.items.push(item);
    this.events.emit("push", item);
  }

  /**
   * Pops the top item from the stack and emits a "pop" event if an item was removed.
   */
  pop(): void {
    const item = this.items.pop();
    if (item) this.events.emit("pop", item);
  }

  /**
   * Subscribes a listener function to a specific event ("push" or "pop").
   * @param event The event name to subscribe to.
   * @param listener The callback function to invoke when the event occurs.
   */
  subscribe(event: string, listener: (item: T) => void): void {
    this.events.on(event, listener);
  }
}

/**
 * Basic Command interface representing an action that can be executed and undone.
 */
export interface Command {
  do(): void;
  undo(): void;
}

/**
 * A composite command that groups multiple commands into a single undoable operation.
 * Executes all child commands in order and undoes them in reverse order.
 */
export type CompositeCommand<T extends Command = Command> = Command & {
  type: "composite";
  commands: T[];
};

/**
 * Creates a composite command from a list of commands.
 * @param commands An array of commands to be grouped into a composite.
 * @returns A composite command with collective do/undo behavior.
 */
export function createCompositeCommand<T extends Command>(commands: T[]): CompositeCommand<T> {
  return {
    type: "composite",
    commands,
    do: () => commands.forEach(cmd => cmd.do()),
    undo: () => [...commands].reverse().forEach(cmd => cmd.undo()),
  };
}