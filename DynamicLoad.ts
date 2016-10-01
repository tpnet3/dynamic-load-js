module DynamicLoad {

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
            xhr.open(this.method, this.url, true);
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

    export class LoadJs {
        private static head: HTMLHeadElement = document.getElementsByTagName("head")[0];
        private static loaded: {[index: string]: {script: HTMLScriptElement; count: number}} = {};

        private src: string;
        private type: string = "text/javascript";
        private callback: Array<() => void> = [];
        private js: {script: HTMLScriptElement; count: number};

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
                LoadJs.loaded[this.src] = {script: document.createElement("script"), count: 1};
                this.js = LoadJs.loaded[this.src];
                this.js.script.type = this.type;
                this.js.script.src = this.src;
                this.js.script.onload = callback;
                LoadJs.head.appendChild(this.js.script);
            }

            return this;
        }

        destroy(): boolean {
            if ( ! this.js) this.js = LoadJs.loaded[this.src];
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

    export class LoadCss {
      private static head: HTMLHeadElement = document.getElementsByTagName("head")[0];
      private static loaded: {[index: string]: {link: HTMLLinkElement; count: number}} = {};

      private href: string;
      private type: string = "text/css";
      private rel: string = "stylesheet";
      private callback: Array<() => void> = [];
      private css: {link: HTMLLinkElement; count: number};

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
              LoadCss.loaded[this.href] = {link: document.createElement("link"), count: 1};
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
          if ( ! this.css) this.css = LoadCss.loaded[this.href];
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

    export class LoadHtml {
        private http: Http;
        private element: HTMLElement;
        private jsList: LoadJs[] = [];
        private callback: Array<(status?: number, responseText?: string) => void> = [];

        constructor(src: string) {
            this.http = Http.get(src)
                .addCallback((status: number, responseText: string) => {
                    var temp: HTMLDivElement = document.createElement("div");
                    temp.innerHTML = responseText;

                    var callback: () => void = () => {
                        for (var i: number = 0; i < this.callback.length; i++) {
                            this.callback[i](status, responseText);
                        }
                    };

                    var nextScripts: NodeListOf<HTMLScriptElement> = temp.getElementsByTagName("script");

                    if (nextScripts.length == 0) {
                        callback();
                    } else {
                        var loading: number = 0;

                        do {
                            loading++;
                            var responseScript: HTMLScriptElement = nextScripts[0];
                            this.jsList.push(LoadJs.getInstance(responseScript.src, responseScript.type).addCallback(() => {
                                loading--;

                                if (loading == 0) {
                                    callback();
                                }
                            }).load());
                            temp.removeChild(responseScript);
                            nextScripts = temp.getElementsByTagName("script");
                        } while (nextScripts.length != 0);
                    }

                    var body: HTMLBodyElement = temp.getElementsByTagName("body")[0];

                    this.element.innerHTML = body ? body.innerHTML : temp.innerHTML;
                });
        }

        addCallback(func: (status?: number, responseText?: string) => void): LoadHtml {
            this.callback.push(func);
            return this;
        }

        put(elem: HTMLElement): LoadHtml {
            this.element = elem;
            this.http.asString();
            return this;
        }

        destroy(elem?: HTMLElement): void {
            if (elem) this.element = elem;
            this.element.innerHTML = "";

            for (var i: number = 0; i < this.jsList.length; i++) {
                this.jsList[i].destroy();
            }

            this.jsList = [];
        }


        static getInstance(src: string): LoadHtml {
            return new LoadHtml(src);
        }
    }

    export class Location {

        static enchantUrl(): boolean {
            var href: string = window.location.href;
            href = href.replace(/#+!+\/*|$/, "#!/");

            var splitIndex: number = href.indexOf("#!/") + 3;
            var firstHref: string = href.slice(0, splitIndex);
            var lastHref: string = href.slice(splitIndex);
            lastHref = lastHref.replace(/\/+/g, "/");
            if (lastHref.length > 0 && lastHref.slice(-1) == "/") lastHref = lastHref.slice(0, -1);
            href = firstHref + lastHref;

            var equal: boolean = window.location.href == href;

            if ( ! equal) {
                window.location.replace(href);
            }

            return equal;
        }

        static uri(goUri?: string): string {
            var href: string = window.location.href;
            var index: number = href.indexOf("#!");

            if (goUri) {
                window.location.replace(href.slice(0, index == -1 ? href.length : index) + "#!" + goUri);
                return goUri;
            } else if (index != -1) {
                var uri: string = href.slice(index + 2, href.length);
                return uri ? uri : "/";
            } else {
                return "/";
            }
        }

        static path(): string {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");
            return uri.slice(0, (q == -1 && h == -1 ? uri.length : (q < h ? q : h))).replace(/\/{2,}/g, "/");
        }

        static query(name?: string): string {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");

            if (name) {
                var results = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)").exec(this.query());
                if ( ! results) return null;
                if ( ! results[2]) return "";
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            } else {
                return uri.slice(q, (h < uri.length && q < h ? h : uri.length));
            }
        }

        static hash(): string {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");
            return uri.slice(h + 1, (q < uri.length && h < q ? q : uri.length));
        }
    }

    interface RouteJsInterface {
        preload?: boolean;
        reload?: boolean;
        create?: string;
        destroy?: string;
        data?: {};
    }

    interface RouteInterface {
        html?: string;
        js?: {[index: string]: RouteJsInterface};
        css?: string[];
    }

    export class Route {
        private static routes: {[index: string]: any} = {};
        private static curParams: {} = {};
        private static curHtml: LoadHtml;
        private static curCss: LoadCss[] = [];
        private static curJs: {loadJs: LoadJs; options: RouteJsInterface}[] = [];

        static uriListener(func: () => void) {
            if (Location.enchantUrl()) {
                func();
            }

            window.addEventListener("hashchange", () => {
                if (Location.enchantUrl()) {
                    func();
                }
            });
        }

        static run(routeJson: string): void {
            var getRoute: (url: string, path: string, callback: (response: RouteInterface, newParams: {}) => void) => void = (url: string, path: string, callback: (response: RouteInterface, newParams: {}) => void) => {
                var routing: (res: {[index: string]: any;}) => void = (res: {[index: string]: any;}) => {
                    var newParams: {} = {};
                    var route: any = res[path];

                    if ( ! route) {
                        var urls: string[] = Object.keys(res);

                        for (var i: number = 0; i < urls.length; i++) {
                            var regex = new RegExp("^" + urls[i].replace(/\{\*}$/, "(.+)").replace(/\{([^\/]+)}/g, "([^\\/]+)") + "$");

                            if (regex.test(path)) {
                                var paramKeys: string[] = regex.exec(urls[i]).slice(1);
                                var paramValues: string[] = regex.exec(path).slice(1);

                                for (var j: number = 0; j < paramKeys.length; j++) {
                                    newParams[paramKeys[j].replace(/^\{(.+)}$/, "$1")] = paramValues[j];
                                }

                                route = res[urls[i]];
                                break;
                            }
                        }
                    }

                    if (typeof route == "string") {
                        getRoute(route, path, callback);
                    } else {
                        callback(route, newParams);
                    }
                };

                if ( ! Route.routes[url]) {
                    Http.get(url)
                        .addCallback((stat: number, res: {[index: string]: any;}) => {
                            Route.routes[url] = res;
                            routing(res);
                        })
                        .asJson();
                } else {
                    routing(Route.routes[url])
                }
            };

            var callFunc: (func: string, root: any, data: {}, params: {}) => void = (func: string, root: any, data: {}, params: {}) => {
                if (func) {
                    var split: string[] = func.split(".", 2);

                    if (root[split[0]]) {
                        if (split[1]) {
                            callFunc(split[1], root[split[0]], data, params);
                        } else {
                            root[split[0]](params, data);
                        }
                    }
                }
            };

            Route.uriListener(() => {
                var path: string = Location.path();

                for (var i: number = 0; i < Route.curJs.length; i++) {
                    if (Route.curJs[i].options.reload) {
                        callFunc(Route.curJs[i].options.destroy, window, Route.curJs[i].options.data, Route.curParams);
                        Route.curJs[i].loadJs.destroy();
                        Route.curJs.splice(i, 1);
                        i--;
                    }
                }

                var newJs: {loadJs: LoadJs; options: RouteJsInterface}[] = [];
                var newCss: LoadCss[] = [];

                var destroyHtml = () => {
                    if (Route.curHtml) {
                        Route.curHtml.destroy();
                        Route.curHtml = null;
                    }
                };

                var destroyCss = () => {
                  for (var i: number = 0; i < Route.curCss.length; i++) {
                      Route.curCss[i].destroy();
                  }

                  Route.curCss = newCss;
                }

                var destroyJs = (params: {}) => {
                    for (var i: number = 0; i < Route.curJs.length; i++) {
                        callFunc(Route.curJs[i].options.destroy, window, Route.curJs[i].options.data, params);
                        Route.curJs[i].loadJs.destroy();
                    }

                    Route.curJs = newJs;
                };

                getRoute(routeJson, path, (route: RouteInterface, newParams: {}) => {
                    var oldParams = {};

                    for (var key in Route.curParams) {
                        if (Route.curParams.hasOwnProperty(key)) {
                            oldParams[key] = Route.curParams[key];
                        }
                    }

                    Route.curParams = newParams;

                    if (route) {
                        var loadHtml = (callback?: () => void) => {
                            if (route.html) {
                                var body: HTMLElement = document.getElementById("body");
                                if ( ! body) body = document.getElementsByTagName("body")[0];
                                Route.curHtml = LoadHtml.getInstance(route.html);
                                if (callback) Route.curHtml.addCallback(callback);
                                Route.curHtml.addCallback(() => {
                                    destroyJs(oldParams);
                                });
                                Route.curHtml.put(body);
                            } else {
                                if (callback) callback();
                                destroyJs(oldParams);
                                destroyHtml();
                            }
                        };

                        var loadCss = () => {
                          if (route.css) {
                            for (var i: number = 0; i < route.css.length; i++) {
                                newCss.push(LoadCss.getInstance(route.css[i]).load());
                            }
                          }

                          destroyCss();
                        }

                        var loadJs = (urls: string[]) => {
                            for (var i: number = 0; i < urls.length; i++) {
                                var options: RouteJsInterface = route.js[urls[i]];

                                newJs.push({
                                    loadJs: LoadJs.getInstance(urls[i]).addCallback(() => {
                                        callFunc(options.create, window, options.data, Route.curParams);
                                    }).load(),
                                    options: options
                                });
                            }
                        };

                        loadCss();

                        if (route.js) {
                            var urls: string[] = Object.keys(route.js);
                            var preloaded: boolean = false;

                            for (var i: number = 0, loading: number = 0; i < urls.length; i++) {
                                if (route.js[urls[i]].preload) {
                                    var options: RouteJsInterface = route.js[urls[i]];
                                    preloaded = true;
                                    loading++;

                                    newJs.push({
                                        loadJs: LoadJs.getInstance(urls[i]).addCallback(() => {
                                            callFunc(options.create, window, options.data, Route.curParams);

                                            loading--;

                                            if (loading == 0) {
                                                loadHtml(() => {
                                                    loadJs(urls);
                                                });
                                            }
                                        }).load(),
                                        options: options
                                    });

                                    urls.splice(i, 1);
                                    i--;
                                }
                            }

                            if ( ! preloaded) {
                                loadHtml(() => {
                                    loadJs(urls);
                                });
                            }
                        } else {
                            loadHtml();
                        }
                    } else {
                        destroyJs(oldParams);
                        destroyHtml();
                    }
                });
            });
        }
    }
}
