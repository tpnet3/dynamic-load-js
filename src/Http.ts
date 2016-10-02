namespace DynamicLoad {

    export class Http {
        private method: string;
        private url: string;
        private callback: Array<(status?: number, response?: any) => void> = [];

        constructor(method: string, url: string) {
            this.method = method;
            this.url = url;
        }

        addCallback(func: (status?: number, response?: any) => void): Http {
            this.callback.push(func);
            return this;
        }

        private send(responseType: string): void {
            var callback: Array<(status?: number, responseText?: any) => void> = this.callback;
            var xhr: XMLHttpRequest = new XMLHttpRequest();

            // Disabled Cache
            var disabledCacheUrl = this.url + (this.url.indexOf("?") == -1 ? "?" : "&") + "_=" + new Date().getTime();
            xhr.open(this.method, disabledCacheUrl, true);
            xhr.onload = function() {
                var response: string;

                if (responseType == "json") {
                    response = JSON.parse(xhr.responseText);
                } else {
                    response = xhr.responseText;
                }

                for (var i: number = 0; i < callback.length; i++) {
                    callback[i](xhr.status, response);
                }
            };
            xhr.send();
        }

        asString(): void {
            this.send("string");
        }

        asJson(): void {
            this.send("json");
        }

        static get(url: string): Http {
            return new Http("GET", url);
        }
    }
}
