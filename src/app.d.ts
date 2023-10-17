/// <reference types="svelte" />
/// <reference types="vite/client" />
declare const VITE_DEFINE_BUILDTIME: number;

declare namespace svelteHTML {
    interface HTMLProps<T> {
        onautocomplete?: (event: CustomEvent) => void;
    }
}
