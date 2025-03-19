import { EventEmitter } from 'events';

export class PubSubStack<T> {
    private items: T[];
    private events: EventEmitter;

    constructor() {
        this.items = [];
        this.events = new EventEmitter();
    }

    push(item: T): void {
        this.items.push(item);
        this.events.emit('push', item);
    }

    pop(): void {
        const item = this.items.pop();
        this.events.emit('pop', item);
    }

    subscribe(event: string, listener: (...args: any[]) => void): void {
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