import type {Action} from "svelte/action";

export const dragscroll: Action<HTMLElement> = (node: HTMLElement) => {
    let isDragging: boolean, lastX: number, lastY: number, curX: number, curY: number, requestedAnimationFrame: number;

    function startHandler(e: PointerEvent) {
        isDragging = true;
        node.style.cursor = "grabbing";
        lastX = e.pageX;
        lastY = e.pageY;
        curX = e.pageX;
        curY = e.pageY;
    }

    function stopHandler() {
        isDragging = false;
        node.style.cursor = "";
        cancelAnimationFrame(requestedAnimationFrame);
    }

    function moveHandler(e: PointerEvent) {
        if (!isDragging) return;
        curX = e.pageX;
        curY = e.pageY;
        cancelAnimationFrame(requestedAnimationFrame);
        requestedAnimationFrame = requestAnimationFrame(frameHandler);
    }

    function frameHandler() {
        const diffX = lastX - curX;
        const diffY = lastY - curY;
        lastX = curX;
        lastY = curY;
        node.scrollLeft += diffX;
        node.scrollTop += diffY;
    }

    node.addEventListener("mousedown", startHandler);
    node.addEventListener("mouseleave", stopHandler);
    node.addEventListener("mouseup", stopHandler);
    node.addEventListener("mousemove", moveHandler);

    return {
        destroy: () => {
            node.removeEventListener("mousedown", startHandler);
            node.removeEventListener("mouseleave", stopHandler);
            node.removeEventListener("mouseup", stopHandler);
            node.removeEventListener("mousemove", moveHandler);
        }
    };
}