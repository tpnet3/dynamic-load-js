declare var attachEvent, detachEvent;

namespace DynamicLoad {

    export class Listener {

        element: HTMLElement;
        handlers: any = [];

        constructor(element: HTMLElement) {
            this.element = element;
        }

        inViewport(el: HTMLElement, callback): Listener {
            var handler = Listener.onVisibilityChange(el, callback);

            this.handlers.push({
                events: ['DOMContentLoaded', 'load', 'scroll', 'resize'],
                handler: handler
            });

            if (addEventListener) {
                addEventListener('DOMContentLoaded', handler, false);
                addEventListener('load', handler, false);
                addEventListener('scroll', handler, false);
                addEventListener('resize', handler, false);
            } else if (attachEvent)  {
                attachEvent('onDOMContentLoaded', handler); // IE9+ :(
                attachEvent('onload', handler);
                attachEvent('onscroll', handler);
                attachEvent('onresize', handler);
            }

            return this;
        }

        destroy(): Listener {
            for (var i = 0; i < this.handlers.length; i++) {
                if (removeEventListener) {
                    for (var j = 0; j < this.handlers.events.length; j++) {
                        removeEventListener(this.handlers.events[j], this.handlers[i], false);
                    }
                } else if (detachEvent)  {
                    for (var j = 0; j < this.handlers.events.length; j++) {
                        detachEvent("on" + this.handlers.events[j], this.handlers[i], false);
                    }
                }
            }

            return this;
        }

        private static onVisibilityChange(el, callback) {
            var old_visible;
            return function () {
                var visible = Listener.isElementInViewport(el);
                if (visible != old_visible) {
                    old_visible = visible;
                    if (typeof callback == 'function') {
                        callback();
                    }
                }
            }
        }

        // by John Resig solution
        private static isElementInViewport(el) {
            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
            );
        }
    }
}
