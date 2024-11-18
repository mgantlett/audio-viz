class EventBus {
    constructor() {
        if (EventBus.instance) {
            return EventBus.instance;
        }
        
        this.listeners = new Map();
        EventBus.instance = this;
    }

    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
            if (this.listeners.get(event)?.size === 0) {
                this.listeners.delete(event);
            }
        };
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        if (callback) {
            this.listeners.get(event).delete(callback);
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        } else {
            this.listeners.delete(event);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    // Clear all event listeners
    clear() {
        this.listeners.clear();
    }

    // Get all registered events
    getEvents() {
        return Array.from(this.listeners.keys());
    }

    // Get listener count for an event
    getListenerCount(event) {
        return this.listeners.get(event)?.size || 0;
    }
}

export default EventBus;
