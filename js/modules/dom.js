export class Dom {
    static cacheSelectors(selectors) {
        const cached = {};
        for (const [key, selector] of Object.entries(selectors)) {
            cached[key] = document.querySelector(selector);
        }
        return cached;
    }

    static delegateEvent(parent, eventType, selector, handler) {
        parent.addEventListener(eventType, e => {
            if (e.target.matches(selector)) {
                handler(e);
            }
        });
    }

    static toggleElementVisibility(element, isVisible) {
        element.style.display = isVisible ? 'block' : 'none';
    }
}