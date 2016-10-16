var DynamicLoad;
(function (DynamicLoad) {
    var Element = (function () {
        function Element(elemOrHtml, parent) {
            this.cloneNodes = [];
            if (elemOrHtml instanceof HTMLElement) {
                var temp = document.createElement("div");
                temp.appendChild(elemOrHtml.cloneNode(true));
                this.element = elemOrHtml;
                this.elemHTML = temp.innerHTML;
                elemOrHtml.style.display = "none";
                if (parent)
                    parent.innerHTML = "";
                this.parent = parent || elemOrHtml.parentNode;
            }
            else {
                this.elemHTML = elemOrHtml;
                if (parent)
                    parent.innerHTML = "";
                this.parent = parent;
            }
        }
        Element.prototype.bind = function (data) {
            for (var i = 1; i < this.cloneNodes.length; i++) {
                this.parent.removeChild(this.cloneNodes[i].node);
            }
            if (this.cloneNodes.length != 0) {
                this.cloneNodes = [this.cloneNodes[0]];
                var keys = Object.keys(data);
                for (var j = 0; j < keys.length; j++) {
                    if (this.cloneNodes[0].cloneData[keys[j]] != data[keys[j]]) {
                        var bindedNodes = this.bindedNodes(data);
                        for (var k = bindedNodes.length - 1; k >= 0; k--) {
                            this.parent.insertBefore(bindedNodes[k], this.cloneNodes[0].nodes[this.cloneNodes[0].nodes.length - 1].nextSibling);
                        }
                        for (var k = 0; k < this.cloneNodes[0].nodes.length; k++) {
                            this.parent.removeChild(this.cloneNodes[0].nodes[k]);
                        }
                        this.cloneNodes[0].nodes = bindedNodes;
                        this.cloneNodes[0].cloneData = JSON.parse(JSON.stringify(data));
                        break;
                    }
                }
            }
            else {
                var bindedNodes = this.bindedNodes(data);
                var nextSibling = this.element ? this.element.nextSibling : this.parent.firstChild;
                for (var k = bindedNodes.length - 1; k >= 0; k--) {
                    this.parent.insertBefore(bindedNodes[k], nextSibling);
                }
                this.cloneNodes.push({
                    data: data,
                    cloneData: JSON.parse(JSON.stringify(data)),
                    nodes: bindedNodes
                });
            }
            return this;
        };
        Element.prototype.refresh = function () {
            for (var i = 0; i < this.cloneNodes.length; i++) {
                var keys = Object.keys(this.cloneNodes[i].data);
                for (var j = 0; j < keys.length; j++) {
                    if (this.cloneNodes[i].cloneData[keys[j]] != this.cloneNodes[i].data[keys[j]]) {
                        var bindedNodes = this.bindedNodes(this.cloneNodes[i].data);
                        for (var k = bindedNodes.length - 1; k >= 0; k--) {
                            this.parent.insertBefore(bindedNodes[k], this.cloneNodes[i].nodes[this.cloneNodes[i].nodes.length - 1].nextSibling);
                        }
                        for (var k = 0; k < this.cloneNodes[i].nodes.length; k++) {
                            this.parent.removeChild(this.cloneNodes[i].nodes[k]);
                        }
                        this.cloneNodes[i].nodes = bindedNodes;
                        this.cloneNodes[i].cloneData = JSON.parse(JSON.stringify(this.cloneNodes[i].data));
                        break;
                    }
                }
            }
            return this;
        };
        Element.prototype.repeat = function (data, refresh) {
            for (var i = 0; i < this.cloneNodes.length; i++) {
                if (data.indexOf(this.cloneNodes[i].data) == -1) {
                    this.parent.removeChild(this.cloneNodes[i].node);
                    this.cloneNodes.splice(i, 1);
                    --i;
                }
            }
            if (refresh) {
                this.refresh();
            }
            var nextNodeIndex = this.cloneNodes.length - 1;
            for (var i = data.length - 1; i >= 0; i--) {
                if (nextNodeIndex != -1 && this.cloneNodes[nextNodeIndex].data === data[i]) {
                    nextNodeIndex--;
                    continue;
                }
                var bindedNodes = this.bindedNodes(data[i]);
                var nextSibling = nextNodeIndex == -1 ? (this.element ? this.element.nextSibling : this.parent.firstChild) : this.cloneNodes[nextNodeIndex].nodes[this.cloneNodes[nextNodeIndex].nodes.length - 1].nextSibling;
                for (var k = bindedNodes.length - 1; k >= 0; k--) {
                    this.parent.insertBefore(bindedNodes[k], nextSibling);
                }
                this.cloneNodes.splice(nextNodeIndex + 1, 0, {
                    data: data[i],
                    cloneData: JSON.parse(JSON.stringify(data[i])),
                    nodes: bindedNodes
                });
            }
            return this;
        };
        Element.prototype.bindedNodes = function (data) {
            var temp = document.createElement("div");
            temp.innerHTML = this.elemHTML;
            if (data) {
                var keys = Object.keys(data);
                for (var i = 0; i < keys.length; i++) {
                    var regex = new RegExp("{{" + keys[i] + "}}", "g");
                    temp.innerHTML = temp.innerHTML.replace(regex, data[keys[i]]);
                }
            }
            return Array.prototype.slice.call(temp.childNodes);
            ;
        };
        return Element;
    }());
    DynamicLoad.Element = Element;
})(DynamicLoad || (DynamicLoad = {}));
var DynamicLoad;
(function (DynamicLoad) {
    var Http = (function () {
        function Http(method, url, data) {
            this.callback = [];
            this.method = method;
            this.url = url;
            this.setData(data);
        }
        Http.prototype.addCallback = function (callback) {
            this.callback.push(callback);
            return this;
        };
        Http.prototype.send = function (responseType) {
            var _this = this;
            var callback = this.callback;
            var xhr = new XMLHttpRequest();
            var runCallback = function (status, responseText) {
                if (status)
                    _this.status = status;
                if (responseText)
                    _this.responseText = responseText;
                var response;
                if (responseType == "json") {
                    response = JSON.parse(_this.responseText);
                }
                else {
                    response = _this.responseText;
                }
                for (var i = 0; i < callback.length; i++) {
                    callback[i](status, response);
                }
            };
            if (!this.status) {
                var disabledCacheUrl = this.url + (this.url.indexOf("?") == -1 ? "?" : "&") + "_=" + new Date().getTime();
                xhr.open(this.method, disabledCacheUrl, true);
                if (this.contentType)
                    xhr.setRequestHeader('Content-Type', this.contentType);
                if (this.auth)
                    xhr.setRequestHeader('Authorization', this.auth);
                xhr.onload = function () {
                    runCallback(xhr.status, xhr.responseText);
                };
                xhr.onerror = function () {
                    runCallback(xhr.status, xhr.responseText);
                };
                if (this.data) {
                    xhr.send(this.data);
                }
                else {
                    xhr.send();
                }
            }
            else {
                runCallback();
            }
        };
        Http.prototype.setAuth = function (auth) {
            this.auth = auth;
            return this;
        };
        Http.prototype.setData = function (data) {
            this.data = data;
            if (this.data instanceof FormData) {
                this.contentType = undefined;
            }
            else if (typeof this.data != "string") {
                this.data = JSON.stringify(this.data);
                this.contentType = "application/json";
            }
            return this;
        };
        Http.prototype.asString = function (callback) {
            if (callback)
                this.addCallback(callback);
            this.send("string");
        };
        Http.prototype.asJson = function (callback) {
            if (callback)
                this.addCallback(callback);
            this.send("json");
        };
        Http.get = function (url) {
            return new Http("GET", url);
        };
        Http.put = function (url, data) {
            return new Http("PUT", url).setData(data);
        };
        Http.post = function (url, data) {
            return new Http("POST", url).setData(data);
        };
        Http.delete = function (url, data) {
            return new Http("DELETE", url).setData(data);
        };
        return Http;
    }());
    DynamicLoad.Http = Http;
})(DynamicLoad || (DynamicLoad = {}));
var DynamicLoad;
(function (DynamicLoad) {
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
})(DynamicLoad || (DynamicLoad = {}));
var DynamicLoad;
(function (DynamicLoad) {
    var LoadHtml = (function () {
        function LoadHtml(src) {
            var _this = this;
            this.isAppend = false;
            this.callback = [];
            this.src = src;
            this.http = DynamicLoad.Http.get(src)
                .addCallback(function (status, responseText) {
                var temp = document.createElement("div");
                temp.innerHTML = responseText;
                if (_this.dataBindRule) {
                    var keys = Object.keys(_this.dataBindRule);
                    for (var i = 0; i < keys.length; i++) {
                        var regex = new RegExp("{{" + keys[i] + "}}", "g");
                        temp.innerHTML = temp.innerHTML.replace(regex, _this.dataBindRule[keys[i]]);
                    }
                }
                var callback = function () {
                    for (var i = 0; i < _this.callback.length; i++) {
                        _this.callback[i](status, responseText);
                    }
                };
                var appendChildren = function (elem) {
                    var childNodes = temp.childNodes;
                    for (var i = 0; i < childNodes.length; i++) {
                        elem.appendChild(childNodes[i]);
                    }
                };
                if (!_this.isAppend) {
                    _this.element.innerHTML = "";
                }
                appendChildren(_this.element);
                if (componentHandler) {
                    componentHandler.upgradeAllRegistered();
                }
                callback();
            });
        }
        LoadHtml.prototype.addCallback = function (func) {
            this.callback.push(func);
            return this;
        };
        LoadHtml.prototype.put = function (elem, dataBindRule) {
            this.element = elem;
            this.isAppend = false;
            this.dataBindRule = dataBindRule;
            this.http.asString();
            return this;
        };
        LoadHtml.prototype.append = function (elem, dataBindRule) {
            this.element = elem;
            this.isAppend = true;
            this.dataBindRule = dataBindRule;
            this.http.asString();
            return this;
        };
        LoadHtml.prototype.destroy = function (elem) {
            if (elem)
                this.element = elem;
            if (!this.element)
                return;
            this.element.innerHTML = "";
        };
        LoadHtml.getInstance = function (src) {
            return new LoadHtml(src);
        };
        return LoadHtml;
    }());
    DynamicLoad.LoadHtml = LoadHtml;
})(DynamicLoad || (DynamicLoad = {}));
var DynamicLoad;
(function (DynamicLoad) {
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
                var disabledCacheSrc = this.src + (this.src.indexOf("?") == -1 ? "?" : "&") + "_=" + new Date().getTime();
                LoadJs.loaded[this.src] = { script: document.createElement("script"), count: 1 };
                this.js = LoadJs.loaded[this.src];
                this.js.script.type = this.type;
                this.js.script.src = disabledCacheSrc;
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
})(DynamicLoad || (DynamicLoad = {}));
var DynamicLoad;
(function (DynamicLoad) {
    var Location = (function () {
        function Location() {
        }
        Location.enchantUrl = function () {
            var href = window.location.href;
            href = href.replace(/#+!+\/*|$/, "#!/");
            var splitIndex = href.indexOf("#!/") + 3;
            var firstHref = href.slice(0, splitIndex);
            var lastHref = href.slice(splitIndex);
            lastHref = lastHref.replace(/\/{2,}/g, "/");
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
            var lastPathIndex = uri.length;
            if (q != -1 && h != -1)
                lastPathIndex = (q < h ? q : h);
            else if (q != -1 && h == -1)
                lastPathIndex = q;
            else if (q == -1 && h != -1)
                lastPathIndex = h;
            return uri.slice(0, lastPathIndex).replace(/\/{2,}/g, "/");
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
})(DynamicLoad || (DynamicLoad = {}));
var DynamicLoad;
(function (DynamicLoad) {
    var Route = (function () {
        function Route() {
        }
        Route.uriListener = function (func) {
            if (DynamicLoad.Location.enchantUrl()) {
                func();
            }
            window.addEventListener("hashchange", function () {
                if (DynamicLoad.Location.enchantUrl()) {
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
                    DynamicLoad.Http.get(url)
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
                    var split = func.split(".");
                    var call = root;
                    for (var i = 0; i < split.length; i++) {
                        if (call[split[i]]) {
                            call = call[split[i]];
                        }
                        else {
                            return;
                        }
                    }
                    if (typeof call == "function") {
                        call(params, data);
                    }
                }
            };
            Route.uriListener(function () {
                var path = DynamicLoad.Location.path();
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
                                Route.curHtml = DynamicLoad.LoadHtml.getInstance(route.html);
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
                                    newCss.push(DynamicLoad.LoadCss.getInstance(route.css[i]).load());
                                }
                            }
                            destroyCss();
                        };
                        var loadJs = function (urls) {
                            for (var i = 0; i < urls.length; i++) {
                                var options = route.js[urls[i]];
                                newJs.push({
                                    loadJs: DynamicLoad.LoadJs.getInstance(urls[i]).addCallback(function () {
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
                                        loadJs: DynamicLoad.LoadJs.getInstance(urls[i]).addCallback(function () {
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
