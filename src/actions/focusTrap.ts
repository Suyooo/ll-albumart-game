import * as focusTrapModule from "focus-trap";
import type {Action} from "svelte/action";

const focusTrap: Action<HTMLElement, undefined> = (node: HTMLElement) => {
    const trap = focusTrapModule.createFocusTrap(node, {initialFocus: false});
    trap.activate();

    return {
        destroy: () => trap.deactivate()
    };
}

export default focusTrap;