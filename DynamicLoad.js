var DynamicLoad;
(function (DynamicLoad) {
    var Http = (function () {
        function Http(method, url) {
            this.callback = [];
            this.method = method;
            this.url = url;
        }
        Http.prototype.addCallback = function (func) {
            this.callback.push(func);
            return this;
        };
        Http.prototype.send = function (responseType) {
            var callback = this.callback;
            var xhr = new XMLHttpRequest();
            xhr.open(this.method, this.url, true);
            xhr.onload = function () {
                var response;
                if (responseType == "json") {
                    response = JSON.parse(xhr.responseText);
                }
                else {
                    response = xhr.responseText;
                }
                for (var i = 0; i < callback.length; i++) {
                    callback[i](xhr.status, response);
                }
            };
            xhr.send();
        };
        Http.prototype.asString = function () {
            this.send("string");
        };
        Http.prototype.asJson = function () {
            this.send("json");
        };
        Http.get = function (url) {
            return new Http("GET", url);
        };
        return Http;
    }());
    DynamicLoad.Http = Http;
    var LoadJs = (function () {
        function LoadJs(src, type) {
            this.type = "text/javascript";
            this.callback = [];
            this.src = src;
            if (type)
                this.type = type;
        }
        LoadJs.prototype.addCallback = function (func) {
            if (func)
                this.callback.push(func);
            return this;
        };
        LoadJs.prototype.load = function () {
            var _this = this;
            this.js = LoadJs.loaded[this.src];
            var callback = function () {
                for (var i = 0; i < _this.callback.length; i++) {
                    _this.callback[i]();
                }
            };
            if (this.js && this.js.count > 0) {
                this.js.count = this.js.count + 1;
                callback();
            }
            else {
                LoadJs.loaded[this.src] = { script: document.createElement("script"), count: 1 };
                this.js = LoadJs.loaded[this.src];
                this.js.script.type = this.type;
                this.js.script.src = this.src;
                this.js.script.onload = callback;
                LoadJs.head.appendChild(this.js.script);
            }
            return this;
        };
        LoadJs.prototype.destroy = function () {
            if (!this.js)
                this.js = LoadJs.loaded[this.src];
            this.js.count = this.js.count - 1;
            if (this.js.count == 0) {
                LoadJs.head.removeChild(this.js.script);
                LoadJs.loaded[this.src] = null;
                this.js = null;
                return true;
            }
            return false;
        };
        LoadJs.getInstance = function (src, type) {
            return new LoadJs(src, type);
        };
        LoadJs.head = document.getElementsByTagName("head")[0];
        LoadJs.loaded = {};
        return LoadJs;
    }());
    DynamicLoad.LoadJs = LoadJs;
    var LoadCss = (function () {
        function LoadCss(href, type, rel) {
            this.type = "text/css";
            this.rel = "stylesheet";
            this.callback = [];
            this.href = href;
            if (type)
                this.type = type;
            if (rel)
                this.rel = rel;
        }
        LoadCss.prototype.addCallback = function (func) {
            this.callback.push(func);
            return this;
        };
        LoadCss.prototype.load = function () {
            var _this = this;
            this.css = LoadCss.loaded[this.href];
            var callback = function () {
                for (var i = 0; i < _this.callback.length; i++) {
                    _this.callback[i]();
                }
            };
            if (this.css && this.css.count > 0) {
                this.css.count = this.css.count + 1;
                callback();
            }
            else {
                LoadCss.loaded[this.href] = { link: document.createElement("link"), count: 1 };
                this.css = LoadCss.loaded[this.href];
                this.css.link.type = this.type;
                this.css.link.rel = this.rel;
                this.css.link.href = this.href;
                this.css.link.onload = callback;
                LoadCss.head.appendChild(this.css.link);
            }
            return this;
        };
        LoadCss.prototype.destroy = function () {
            if (!this.css)
                this.css = LoadCss.loaded[this.href];
            this.css.count = this.css.count - 1;
            if (this.css.count == 0) {
                LoadCss.head.removeChild(this.css.link);
                LoadCss.loaded[this.href] = null;
                this.css = null;
                return true;
            }
            return false;
        };
        LoadCss.getInstance = function (src, type, ref) {
            return new LoadCss(src, type, ref);
        };
        LoadCss.head = document.getElementsByTagName("head")[0];
        LoadCss.loaded = {};
        return LoadCss;
    }());
    DynamicLoad.LoadCss = LoadCss;
    var LoadHtml = (function () {
        function LoadHtml(src) {
            var _this = this;
            this.jsList = [];
            this.callback = [];
            this.http = Http.get(src)
                .addCallback(function (status, responseText) {
                var temp = document.createElement("div");
                temp.innerHTML = responseText;
                var callback = function () {
                    for (var i = 0; i < _this.callback.length; i++) {
                        _this.callback[i](status, responseText);
                    }
                };
                var nextScripts = temp.getElementsByTagName("script");
                if (nextScripts.length == 0) {
                    callback();
                }
                else {
                    var loading = 0;
                    do {
                        loading++;
                        var responseScript = nextScripts[0];
                        _this.jsList.push(LoadJs.getInstance(responseScript.src, responseScript.type).addCallback(function () {
                            loading--;
                            if (loading == 0) {
                                callback();
                            }
                        }).load());
                        temp.removeChild(responseScript);
                        nextScripts = temp.getElementsByTagName("script");
                    } while (nextScripts.length != 0);
                }
                var body = temp.getElementsByTagName("body")[0];
                _this.element.innerHTML = body ? body.innerHTML : temp.innerHTML;
            });
        }
        LoadHtml.prototype.addCallback = function (func) {
            this.callback.push(func);
            return this;
        };
        LoadHtml.prototype.put = function (elem) {
            this.element = elem;
            this.http.asString();
            return this;
        };
        LoadHtml.prototype.destroy = function (elem) {
            if (elem)
                this.element = elem;
            this.element.innerHTML = "";
            for (var i = 0; i < this.jsList.length; i++) {
                this.jsList[i].destroy();
            }
            this.jsList = [];
        };
        LoadHtml.getInstance = function (src) {
            return new LoadHtml(src);
        };
        return LoadHtml;
    }());
    DynamicLoad.LoadHtml = LoadHtml;
    var Location = (function () {
        function Location() {
        }
        Location.enchantUrl = function () {
            var href = window.location.href;
            href = href.replace(/#+!+\/*|$/, "#!/");
            var splitIndex = href.indexOf("#!/") + 3;
            var firstHref = href.slice(0, splitIndex);
            var lastHref = href.slice(splitIndex);
            lastHref = lastHref.replace(/\/+/g, "/");
            if (lastHref.length > 0 && lastHref.slice(-1) == "/")
                lastHref = lastHref.slice(0, -1);
            href = firstHref + lastHref;
            var equal = window.location.href == href;
            if (!equal) {
                window.location.replace(href);
            }
            return equal;
        };
        Location.uri = function (goUri) {
            var href = window.location.href;
            var index = href.indexOf("#!");
            if (goUri) {
                window.location.replace(href.slice(0, index == -1 ? href.length : index) + "#!" + goUri);
                return goUri;
            }
            else if (index != -1) {
                var uri = href.slice(index + 2, href.length);
                return uri ? uri : "/";
            }
            else {
                return "/";
            }
        };
        Location.path = function () {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");
            return uri.slice(0, (q == -1 && h == -1 ? uri.length : (q < h ? q : h))).replace(/\/{2,}/g, "/");
        };
        Location.query = function (name) {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");
            if (name) {
                var results = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)").exec(this.query());
                if (!results)
                    return null;
                if (!results[2])
                    return "";
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            }
            else {
                return uri.slice(q, (h < uri.length && q < h ? h : uri.length));
            }
        };
        Location.hash = function () {
            var uri = this.uri();
            var q = uri.indexOf("?");
            var h = uri.indexOf("#");
            return uri.slice(h + 1, (q < uri.length && h < q ? q : uri.length));
        };
        return Location;
    }());
    DynamicLoad.Location = Location;
    var Route = (function () {
        function Route() {
        }
        Route.uriListener = function (func) {
            if (Location.enchantUrl()) {
                func();
            }
            window.addEventListener("hashchange", function () {
                if (Location.enchantUrl()) {
                    func();
                }
            });
        };
        Route.run = function (routeJson) {
            var getRoute = function (url, path, callback) {
                var routing = function (res) {
                    var newParams = {};
                    var route = res[path];
                    if (!route) {
                        var urls = Object.keys(res);
                        for (var i = 0; i < urls.length; i++) {
                            var regex = new RegExp("^" + urls[i].replace(/\{\*}$/, "(.+)").replace(/\{([^\/]+)}/g, "([^\\/]+)") + "$");
                            if (regex.test(path)) {
                                var paramKeys = regex.exec(urls[i]).slice(1);
                                var paramValues = regex.exec(path).slice(1);
                                for (var j = 0; j < paramKeys.length; j++) {
                                    newParams[paramKeys[j].replace(/^\{(.+)}$/, "$1")] = paramValues[j];
                                }
                                route = res[urls[i]];
                                break;
                            }
                        }
                    }
                    if (typeof route == "string") {
                        getRoute(route, path, callback);
                    }
                    else {
                        callback(route, newParams);
                    }
                };
                if (!Route.routes[url]) {
                    Http.get(url)
                        .addCallback(function (stat, res) {
                        Route.routes[url] = res;
                        routing(res);
                    })
                        .asJson();
                }
                else {
                    routing(Route.routes[url]);
                }
            };
            var callFunc = function (func, root, data, params) {
                if (func) {
                    var split = func.split(".", 2);
                    if (root[split[0]]) {
                        if (split[1]) {
                            callFunc(split[1], root[split[0]], data, params);
                        }
                        else {
                            root[split[0]](params, data);
                        }
                    }
                }
            };
            Route.uriListener(function () {
                var path = Location.path();
                for (var i = 0; i < Route.curJs.length; i++) {
                    if (Route.curJs[i].options.reload) {
                        callFunc(Route.curJs[i].options.destroy, window, Route.curJs[i].options.data, Route.curParams);
                        Route.curJs[i].loadJs.destroy();
                        Route.curJs.splice(i, 1);
                        i--;
                    }
                }
                var newJs = [];
                var newCss = [];
                var destroyHtml = function () {
                    if (Route.curHtml) {
                        Route.curHtml.destroy();
                        Route.curHtml = null;
                    }
                };
                var destroyCss = function () {
                    for (var i = 0; i < Route.curCss.length; i++) {
                        Route.curCss[i].destroy();
                    }
                    Route.curCss = newCss;
                };
                var destroyJs = function (params) {
                    for (var i = 0; i < Route.curJs.length; i++) {
                        callFunc(Route.curJs[i].options.destroy, window, Route.curJs[i].options.data, params);
                        Route.curJs[i].loadJs.destroy();
                    }
                    Route.curJs = newJs;
                };
                getRoute(routeJson, path, function (route, newParams) {
                    var oldParams = {};
                    for (var key in Route.curParams) {
                        if (Route.curParams.hasOwnProperty(key)) {
                            oldParams[key] = Route.curParams[key];
                        }
                    }
                    Route.curParams = newParams;
                    if (route) {
                        var loadHtml = function (callback) {
                            if (route.html) {
                                var body = document.getElementById("body");
                                if (!body)
                                    body = document.getElementsByTagName("body")[0];
                                Route.curHtml = LoadHtml.getInstance(route.html);
                                if (callback)
                                    Route.curHtml.addCallback(callback);
                                Route.curHtml.addCallback(function () {
                                    destroyJs(oldParams);
                                });
                                Route.curHtml.put(body);
                            }
                            else {
                                if (callback)
                                    callback();
                                destroyJs(oldParams);
                                destroyHtml();
                            }
                        };
                        var loadCss = function () {
                            if (route.css) {
                                for (var i = 0; i < route.css.length; i++) {
                                    newCss.push(LoadCss.getInstance(route.css[i]).load());
                                }
                            }
                            destroyCss();
                        };
                        var loadJs = function (urls) {
                            for (var i = 0; i < urls.length; i++) {
                                var options = route.js[urls[i]];
                                newJs.push({
                                    loadJs: LoadJs.getInstance(urls[i]).addCallback(function () {
                                        callFunc(options.create, window, options.data, Route.curParams);
                                    }).load(),
                                    options: options
                                });
                            }
                        };
                        loadCss();
                        if (route.js) {
                            var urls = Object.keys(route.js);
                            var preloaded = false;
                            for (var i = 0, loading = 0; i < urls.length; i++) {
                                if (route.js[urls[i]].preload) {
                                    var options = route.js[urls[i]];
                                    preloaded = true;
                                    loading++;
                                    newJs.push({
                                        loadJs: LoadJs.getInstance(urls[i]).addCallback(function () {
                                            callFunc(options.create, window, options.data, Route.curParams);
                                            loading--;
                                            if (loading == 0) {
                                                loadHtml(function () {
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
                                loadHtml(function () {
                                    loadJs(urls);
                                });
                            }
                        }
                        else {
                            loadHtml();
                        }
                    }
                    else {
                        destroyJs(oldParams);
                        destroyHtml();
                    }
                });
            });
        };
        Route.routes = {};
        Route.curParams = {};
        Route.curCss = [];
        Route.curJs = [];
        return Route;
    }());
    DynamicLoad.Route = Route;
})(DynamicLoad || (DynamicLoad = {}));
