# Dynamic Load JS
Lightweight, Scalable

## Installation
Hosted by github
```html
<script type="text/javascript" src="https://tpnet3.github.io/dynamic-load-js/dist/latest/DynamicLoad.min.js"></script>
```

Download via bower
```
bower install dynamic-load-js
```

## License
[MIT License](LICENSE)

# API Reference

## DynamicLoad.Element

### constructor(element: HTMLElement)
```javascript
var element = new DynamicLoad.Element(document.getElementById("foo"));
```

### getNodes(): [{nodes: Node[]}]
```javascript
element.getNodes();
```

### bind(data: {[index: string]: any}): Element
```javascript
element.bind({ bar: "first" });
```

### refresh(): Element
```javascript
element.refresh();
```

### repeat(data: [{[index: string]: any}], refresh?: boolean): Element
```javascript
element.repeat([{ bar: "first" }, { bar: "second" }], true);
```

## DynamicLoad.Http

### constructor(method: string, url: string, data?: any)
```javascript
new DynamicLoad.Http("METHOD", "sume/path", {});
```

### static get(url: string): Http
```javascript
var httpGet = DynamicLoad.Http.get("sume/path");
```

### static put(url: string, data?: any): Http
```javascript
var httpPut = DynamicLoad.Http.put("sume/path", {});
```

### static post(url: string, data?: any): Http
```javascript
var httpPost = DynamicLoad.Http.post("sume/path", {});
```

### static delete(url: string, data?: any): Http
```javascript
var httpDelete = DynamicLoad.Http.delete("sume/path", {});
```

### addCallback(callback: (status?: number, response?: any) => void): Http
```javascript
httpGet.addCallback(function(status, response) {
    // Get response
});
```

### setData(data: any): Http
```javascript
httpPost.setData({
    foo: "bar"
});
```

### asString(callback?: (status?: number, response?: any) => void): void
```javascript
httpGet.asString(function(status, response) {
    // Get response as string
});
```

### asJson(callback?: (status?: number, response?: any) => void): void
```javascript
httpGet.asJson(function(status, response) {
    // Get response as json
});
```

## DynamicLoad.Listener

### constructor(element: HTMLElement)
```javascript
var listener = new DynamicLoad.Listener(document.getElementById("foo"));
```

### inViewport(el: HTMLElement, callback: (visible: boolean) => void): Listener
```javascript
listener.inViewport(document.getElementById("bar"), function(visible) {
    // do
})
```

### destroy(): Listener
```javascript
listener.destroy();
```
