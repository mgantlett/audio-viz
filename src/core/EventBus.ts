import type { AppEvent, EventHandler, IEventBus } from '../types/events';

export class EventBus implements IEventBus {
    private static instance: EventBus;
    private handlers: Map<AppEvent['type'], Set<EventHandler<any>>>;

    private constructor() {
        this.handlers = new Map();
    }

    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    on<T extends AppEvent['type']>(
        type: T,
        handler: EventHandler<Extract<AppEvent, { type: T }>>
    ): void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type)?.add(handler);
    }

    off<T extends AppEvent['type']>(
        type: T,
        handler: EventHandler<Extract<AppEvent, { type: T }>>
    ): void {
        this.handlers.get(type)?.delete(handler);
    }

    emit<T extends AppEvent>(event: T): void {
        const handlers = this.handlers.get(event.type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(event);
                } catch (error) {
                    console.error(`Error in event handler for ${event.type}:`, error);
                }
            });
        }
    }
}

export const eventBus = EventBus.getInstance();
export default eventBus;
