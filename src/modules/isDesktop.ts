export default () => {
    return !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        // iOS 13 stopped reporting iPad in the userAgent because that is good design thanks apple
        && !(navigator.userAgent.includes("Mac") && "ontouchend" in document)
}