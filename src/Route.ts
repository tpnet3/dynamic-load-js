namespace DynamicLoad {

    interface RouteJsInterface {
        preload?: boolean;
        reload?: boolean;
        create?: string;
        destroy?: string;
        data?: {};
    }

    interface RouteInterface {
        html?: string;
        js?: { [index: string]: RouteJsInterface };
        css?: string[];
    }

    export class Route {
        private static routes: { [index: string]: any } = {};
        private static curParams: {} = {};
        private static curHtml: LoadHtml;
        private static curCss: LoadCss[] = [];
        private static curJs: { loadJs: LoadJs; options: RouteJsInterface }[] = [];

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
                var routing: (res: { [index: string]: any; }) => void = (res: { [index: string]: any; }) => {
                    var newParams: {} = {};
                    var route: any = res[path];

                    if (!route) {
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

                if (!Route.routes[url]) {
                    Http.get(url)
                        .addCallback((stat: number, res: { [index: string]: any; }) => {
                            Route.routes[url] = res;
                            routing(res);
                        })
                        .asJson();
                } else {
                    routing(Route.routes[url])
                }
            };

            var callFunc = (func: string, root: any, data: {}, params: {}) => {
                if (func) {
                    var split: string[] = func.split(".");
                    var call: any = root;

                    for (var i: number = 0; i < split.length; i++) {
                        if (call[split[i]]) {
                            call = call[split[i]];
                        } else {
                            return;
                        }
                    }

                    if (typeof call == "function") {
                        call(params, data);
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

                var newJs: { loadJs: LoadJs; options: RouteJsInterface }[] = [];
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
                                if (!body) body = document.getElementsByTagName("body")[0];
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
                            //var loading = 0;

                            for (var i: number = 0; i < urls.length; i++) {
                                var options: RouteJsInterface = route.js[urls[i]];

                                newJs.push({
                                    loadJs: LoadJs.getInstance(urls[i]).addCallback(() => {
                                        callFunc(options.create, window, options.data, Route.curParams);

                                        /*
                                        loading++;

                                        if (componentHandler && loading == urls.length) {
                                            componentHandler.upgradeAllRegistered();
                                        }
                                        */
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

                            if (!preloaded) {
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
