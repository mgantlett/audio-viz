import type { EventType, AppEvent, EventTypeFromName } from '../types/events';

export class EventBus {
    private handlers: Map<EventType, Array<(event: AppEvent) => void>> = new Map();

    public emit<T extends EventType>(event: EventTypeFromName<T>): void {
        const handlers = this.handlers.get(event.type);
        if (handlers) {
            handlers.forEach(handler => handler(event));
        }
    }

    public on<T extends EventType>(eventType: T, handler: (event: EventTypeFromName<T>) => void): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)?.push(handler as (event: AppEvent) => void);
    }

    public once<T extends EventType>(eventType: T, handler: (event: EventTypeFromName<T>) => void): void {
        const onceHandler = (event: EventTypeFromName<T>): void => {
            this.off(eventType, onceHandler);
            handler(event);
        };
        this.on(eventType, onceHandler);
    }

    public off<T extends EventType>(eventType: T, handler: (event: EventTypeFromName<T>) => void): void {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler as (event: AppEvent) => void);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    public hasListeners(eventType: EventType): boolean {
        const handlers = this.handlers.get(eventType);
        return handlers !== undefined && handlers.length > 0;
    }

    public clearAll(): void {
        this.handlers.clear();
    }

    public static create(): EventBus {
        return new EventBus();
    }
}
