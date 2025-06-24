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

  toArray(): T[] {
    return [...this.items];
  }
}

export function getHexColorString(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}
