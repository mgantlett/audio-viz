/**
 * Base class for all components in the application.
 * @template TDeps Type of dependencies required by the component
 */
export abstract class Component<TDeps = void> {
    protected initialized: boolean = false;

    constructor(protected readonly deps?: TDeps) {}

    /**
     * Initialize the component instance.
     * This is called automatically by the component system.
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;
        await this.initializeComponent();
        this.initialized = true;
    }

    /**
     * Component-specific initialization logic.
     * Must be implemented by derived classes.
     */
    protected abstract initializeComponent(): Promise<void>;

    /**
     * Clean up the component.
     * This is called automatically by the component system.
     */
    async cleanup(): Promise<void> {
        if (!this.initialized) return;
        await this.cleanupComponent();
        this.initialized = false;
    }

    /**
     * Component-specific cleanup logic.
     * Can be overridden by derived classes.
     */
    protected cleanupComponent(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Check if the component is initialized.
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

/**
 * Base class for singleton components.
 * @template TComponent Type of the component
 * @template TDeps Type of dependencies required by the component
 */
export abstract class SingletonComponent<TDeps> extends Component<TDeps> {
    private static instances = new Map<string, SingletonComponent<any>>();
    private static deps = new Map<string, any>();

    protected constructor(deps: TDeps) {
        super(deps);
    }

    static getInstance<T extends SingletonComponent<D>, D = any>(deps?: D): T {
        const key = this.name;
        if (!this.instances.has(key)) {
            if (deps) {
                this.deps.set(key, deps);
            }
            this.instances.set(key, new (this as any)(this.deps.get(key)));
        } else if (deps) {
            // Update dependencies if provided
            const instance = this.instances.get(key) as T;
            (instance as any).deps = deps;
        }
        return this.instances.get(key) as T;
    }

    static async initialize<T extends SingletonComponent<D>, D = any>(deps?: D): Promise<void> {
        const instance = this.getInstance<T, D>(deps);
        await instance.initialize();
    }

    static async cleanup(): Promise<void> {
        const key = this.name;
        const instance = this.instances.get(key);
        if (instance) {
            await instance.cleanup();
            this.instances.delete(key);
            this.deps.delete(key);
        }
    }
}

/**
 * Type helper for component constructor
 */
export type ComponentConstructor<T extends Component<D>, D = void> = {
    new (deps: D): T;
    initialize(): Promise<void>;
};

/**
 * Type helper for singleton constructor
 */
export type SingletonConstructor<T extends SingletonComponent<D>, D> = {
    new (deps: D): T;
    getInstance(deps: D): T;
    initialize(deps: D): Promise<void>;
    cleanup(): Promise<void>;
};
