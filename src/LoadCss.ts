namespace DynamicLoad {

    export class LoadCss {
        private static head: HTMLHeadElement = document.getElementsByTagName("head")[0];
        private static loaded: { [index: string]: { link: HTMLLinkElement; count: number } } = {};

        private href: string;
        private type: string = "text/css";
        private rel: string = "stylesheet";
        private callback: Array<() => void> = [];
        private css: { link: HTMLLinkElement; count: number };

        constructor(href: string, type?: string, rel?: string) {
            this.href = href;
            if (type) this.type = type;
            if (rel) this.rel = rel;
        }

        addCallback(func: () => void): LoadCss {
            this.callback.push(func);
            return this;
        }

        load(): LoadCss {
            this.css = LoadCss.loaded[this.href];
            var callback: () => void = () => {
                for (var i: number = 0; i < this.callback.length; i++) {
                    this.callback[i]();
                }
            };

            if (this.css && this.css.count > 0) {
                this.css.count = this.css.count + 1;
                callback();
            } else {
                LoadCss.loaded[this.href] = { link: document.createElement("link"), count: 1 };
                this.css = LoadCss.loaded[this.href];
                this.css.link.type = this.type;
                this.css.link.rel = this.rel;
                this.css.link.href = this.href;
                this.css.link.onload = callback;
                LoadCss.head.appendChild(this.css.link);
            }

            return this;
        }

        destroy(): boolean {
            if (!this.css) this.css = LoadCss.loaded[this.href];
            this.css.count = this.css.count - 1;

            if (this.css.count == 0) {
                LoadCss.head.removeChild(this.css.link);
                LoadCss.loaded[this.href] = null;
                this.css = null;
                return true;
            }

            return false;
        }

        static getInstance(src: string, type?: string, ref?: string): LoadCss {
            return new LoadCss(src, type, ref);
        }
    }
}
