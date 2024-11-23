export abstract class Component {
    protected static _instance: any;
    protected initialized: boolean = false;

    protected constructor() {
        this.initialized = false;
    }

    protected static get instance(): any {
        return this._instance;
    }

    protected static set instance(value: any) {
        this._instance = value;
    }

    static getInstance(): Component {
        if (!this.instance) {
            this.instance = new (this as any)();
        }
        return this.instance;
    }

    static async initialize(): Promise<void> {
        const instance = this.getInstance();
        if (!instance.initialized) {
            await instance.initializeComponent();
            instance.initialized = true;
        }
    }

    protected abstract initializeComponent(): Promise<void>;

    isInitialized(): boolean {
        return this.initialized;
    }
}
