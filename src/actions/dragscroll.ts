import type {Action} from "svelte/action";

const dragscroll: Action<HTMLElement> = (node: HTMLElement) => {
    let isDragging: boolean, lastX: number, lastY: number, curX: number, curY: number, requestedAnimationFrame: number;

    function startHandler(e: Touch): void;
    function startHandler(e: PointerEvent): void;
    function startHandler(e: PointerEvent | Touch): void {
        isDragging = true;
        node.style.cursor = "grabbing";
        lastX = e.pageX;
        lastY = e.pageY;
        curX = e.pageX;
        curY = e.pageY;
    }

    function touchStartHandler(e: TouchEvent): void {
        if (e.targetTouches.length === 0) return;
        e.preventDefault();
        startHandler(e.targetTouches.item(0));
    }

    function stopHandler(): void {
        if (!isDragging) return;
        isDragging = false;
        node.style.cursor = "";
        cancelAnimationFrame(requestedAnimationFrame);
    }

    function moveHandler(e: Touch): void;
    function moveHandler(e: PointerEvent): void;
    function moveHandler(e: PointerEvent | Touch): void {
        if (!isDragging) return;
        curX = e.pageX;
        curY = e.pageY;
        cancelAnimationFrame(requestedAnimationFrame);
        requestedAnimationFrame = requestAnimationFrame(frameHandler);
    }

    function touchMoveHandler(e: TouchEvent): void {
        if (e.targetTouches.length === 0) return;
        e.preventDefault();
        moveHandler(e.targetTouches.item(0));
    }

    function frameHandler(): void {
        const diffX = lastX - curX;
        const diffY = lastY - curY;
        lastX = curX;
        lastY = curY;
        node.scrollLeft += diffX;
        node.scrollTop += diffY;
    }

    node.addEventListener("mousedown", startHandler);
    document.addEventListener("mouseup", stopHandler);
    document.addEventListener("mousemove", moveHandler);

    node.addEventListener("touchstart", touchStartHandler);
    document.addEventListener("touchend", stopHandler);
    document.addEventListener("touchcancel", stopHandler);
    document.addEventListener("touchmove", touchMoveHandler);

    return {
        destroy: () => {
            node.removeEventListener("mousedown", startHandler);
            document.removeEventListener("mouseup", stopHandler);
            document.removeEventListener("mousemove", moveHandler);

            node.removeEventListener("touchstart", touchStartHandler);
            document.removeEventListener("touchend", stopHandler);
            document.removeEventListener("touchcancel", stopHandler);
            document.removeEventListener("touchmove", touchMoveHandler);
        }
    };
}

export default dragscroll;