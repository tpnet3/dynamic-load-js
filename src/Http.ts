namespace DynamicLoad {

    export class Http {
        private method: string;
        private url: string;
        private status: number;
        private data: any;
        private responseText: string;
        private callback: Array<(status?: number, response?: any) => void> = [];

        constructor(method: string, url: string, data?: any) {
            this.method = method;
            this.url = url;
            this.setData(data);
        }

        addCallback(callback: (status?: number, response?: any) => void): Http {
            this.callback.push(callback);
            return this;
        }

        private send(responseType: string): void {
            var callback: Array<(status?: number, responseText?: any) => void> = this.callback;
            var xhr: XMLHttpRequest = new XMLHttpRequest();

            var runCallback = (status?: number, responseText?: string) => {
              if (status) this.status = status;
              if (responseText) this.responseText = responseText;
              var response: string;

              if (responseType == "json") {
                  response = JSON.parse(this.responseText);
              } else {
                  response = this.responseText;
              }

              for (var i: number = 0; i < callback.length; i++) {
                  callback[i](status, response);
              }
            }

            if ( ! this.status) {
              // Disabled Cache
              var disabledCacheUrl = this.url + (this.url.indexOf("?") == -1 ? "?" : "&") + "_=" + new Date().getTime();
              xhr.open(this.method, disabledCacheUrl, true);
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.onload = () => {
                  runCallback(xhr.status, xhr.responseText);
              };

              if (this.data) {
                xhr.send(this.data);
              } else {
                xhr.send();
              }
            } else {
              runCallback();
            }
        }

        setData(data: any): Http {
            this.data = data;

            if (typeof this.data != "string") {
                this.data = JSON.stringify(this.data);
            }

            return this;
        }

        asString(callback?: (status?: number, response?: any) => void): void {
            if (callback) this.addCallback(callback);
            this.send("string");
        }

        asJson(callback?: (status?: number, response?: any) => void): void {
            if (callback) this.addCallback(callback);
            this.send("json");
        }

        static get(url: string): Http {
            return new Http("GET", url);
        }

        static put(url: string, data?: any): Http {
            return new Http("PUT", url).setData(data);
        }

        static post(url: string, data?: any): Http {
            return new Http("POST", url).setData(data);
        }

        static delete(url: string, data?: any): Http {
            return new Http("DELETE", url).setData(data);
        }
    }
}
