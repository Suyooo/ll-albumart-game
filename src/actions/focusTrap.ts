import * as focusTrapModule from 'focus-trap';
import type {Action} from "svelte/action";

export const focusTrap: Action<HTMLInputElement> = (node: HTMLInputElement) => {
    const trap = focusTrapModule.createFocusTrap(node, {initialFocus: false});
    trap.activate();

    return {
        destroy: () => trap.deactivate()
    };
}