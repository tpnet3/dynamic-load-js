namespace DynamicLoad {

    export class Listener {

        element: any;
        handlers: any = [];

        constructor(element: HTMLElement) {
            this.element = element;
        }

        inViewport(el: HTMLElement, callback: () => void): Listener {
            var handler = Listener.onVisibilityChange(el, callback);

            this.handlers.push({
                events: ['DOMContentLoaded', 'load', 'scroll', 'resize'],
                handler: handler
            });

            if (addEventListener) {
                this.element.addEventListener('DOMContentLoaded', handler, false);
                this.element.addEventListener('load', handler, false);
                this.element.addEventListener('scroll', handler, false);
                this.element.addEventListener('resize', handler, false);
            } else if (this.element.attachEvent)  {
                this.element.attachEvent('onDOMContentLoaded', handler); // IE9+ :(
                this.element.attachEvent('onload', handler);
                this.element.attachEvent('onscroll', handler);
                this.element.attachEvent('onresize', handler);
            }

            return this;
        }

        destroy(): Listener {
            for (var i = 0; i < this.handlers.length; i++) {
                if (this.element.removeEventListener) {
                    for (var j = 0; j < this.handlers[i].events.length; j++) {
                        this.element.removeEventListener(this.handlers[i].events[j], this.handlers[i].handler, false);
                    }
                } else if (this.element.detachEvent)  {
                    for (var j = 0; j < this.handlers[i].events.length; j++) {
                        this.element.detachEvent("on" + this.handlers[i].events[j], this.handlers[i].handler, false);
                    }
                }
            }

            this.handlers = [];

            return this;
        }

        private static onVisibilityChange(el, callback) {
            var old_visible;
            return function () {
                var visible = Listener.isElementInViewport(el);
                if (visible != old_visible) {
                    old_visible = visible;
                    if (typeof callback == 'function') {
                        callback(visible);
                    }
                }
            }
        }

        // by John Resig solution
        private static isElementInViewport(el) {
            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0
            );
            
            /*
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
            */
        }
    }
}
