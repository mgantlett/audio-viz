/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    accept(cb?: (mod: any) => void): void;
    dispose(cb?: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    data: any;
  };
}
