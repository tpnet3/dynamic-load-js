namespace DynamicLoad {

    export class LoadJs {
        private static head: HTMLHeadElement = document.getElementsByTagName("head")[0];
        private static loaded: { [index: string]: { script: HTMLScriptElement; count: number } } = {};

        private src: string;
        private type: string = "text/javascript";
        private callback: Array<() => void> = [];
        private js: { script: HTMLScriptElement; count: number };

        constructor(src: string, type?: string) {
            this.src = src;
            if (type) this.type = type;
        }

        addCallback(func?: () => void): LoadJs {
            if (func) this.callback.push(func);
            return this;
        }

        load(): LoadJs {
            this.js = LoadJs.loaded[this.src];
            var callback: () => void = () => {
                for (var i: number = 0; i < this.callback.length; i++) {
                    this.callback[i]();
                }
            };

            if (this.js && this.js.count > 0) {
                this.js.count = this.js.count + 1;
                callback();
            } else {
                var disabledCacheSrc = this.src + (this.src.indexOf("?") == -1 ? "?" : "&") + "_=" + new Date().getTime();

                LoadJs.loaded[this.src] = { script: document.createElement("script"), count: 1 };
                this.js = LoadJs.loaded[this.src];
                this.js.script.type = this.type;
                this.js.script.src = disabledCacheSrc;
                this.js.script.onload = callback;
                LoadJs.head.appendChild(this.js.script);
            }

            return this;
        }

        destroy(): boolean {
            if (!this.js) this.js = LoadJs.loaded[this.src];
            this.js.count = this.js.count - 1;

            if (this.js.count == 0) {
                LoadJs.head.removeChild(this.js.script);
                LoadJs.loaded[this.src] = null;
                this.js = null;
                return true;
            }

            return false;
        }

        static getInstance(src: string, type?: string): LoadJs {
            return new LoadJs(src, type);
        }
    }
}
