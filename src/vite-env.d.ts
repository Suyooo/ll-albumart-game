/// <reference types="svelte" />
/// <reference types="vite/client.d.ts" />
declare const INDEV: boolean;
declare const BUILDTIME: number;
declare const BUILDDATE: string;

declare namespace svelte.JSX {
    interface HTMLProps<T> {
        onautocomplete?: (event: CustomEvent) => void;
    }
}