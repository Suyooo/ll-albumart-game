import * as focusTrapModule from "focus-trap";
import type {Action} from "svelte/action";

export const focusTrap: Action<HTMLElement> = (node: HTMLElement) => {
    const trap = focusTrapModule.createFocusTrap(node, {initialFocus: false});
    trap.activate();

    return {
        destroy: () => trap.deactivate()
    };
}