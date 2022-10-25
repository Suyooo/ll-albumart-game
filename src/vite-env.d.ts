/// <reference types="svelte" />
/// <reference types="vite/client.d.ts" />
declare const INDEV: boolean;

declare namespace svelte.JSX {
    interface HTMLProps<T> {
        onacselection?: (event: CustomEvent) => void;
    }
}