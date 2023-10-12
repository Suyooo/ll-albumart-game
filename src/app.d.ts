/// <reference types="svelte" />
/// <reference types="vite/client" />
declare const BUILDTIME: number;
declare const BUILDDATE: string;

declare namespace svelteHTML {
    interface HTMLProps<T> {
        onautocomplete?: (event: CustomEvent) => void;
    }
}
